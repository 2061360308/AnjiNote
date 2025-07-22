use tauri::command;
use std::process::Stdio;
use tokio::process::Command;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[command]
pub async fn check_gpg_installed() -> bool {
    let output = Command::new("gpg")
        .arg("--version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NO_WINDOW) // 关键：隐藏cmd窗口
        .output()
        .await;
    output.map(|o| o.status.success()).unwrap_or(false)
}

#[command]
pub async fn check_key_can_encrypt(fingerprint: String) -> bool {
    let output = Command::new("gpg")
        .args(["--with-colons", "--list-keys"])
        .output()
        .await;
    if let Ok(out) = output {
        if !out.status.success() {
            return false;
        }
        let text = String::from_utf8_lossy(&out.stdout).replace("\r\n", "\n");
        let re = regex::Regex::new(r"sub:.*\n(?:fpr:.*\n)?").unwrap();
        for block in re.find_iter(&text) {
            let block = block.as_str();
            let sub_line = block.lines().find(|l| l.starts_with("sub:"));
            let fpr_line = block.lines().find(|l| l.starts_with("fpr:"));
            if let (Some(sub), Some(fpr)) = (sub_line, fpr_line) {
                let sub_fields: Vec<&str> = sub.split(':').collect();
                let fpr_fields: Vec<&str> = fpr.split(':').collect();
                let capabilities = sub_fields.get(11).unwrap_or(&"");
                let fpr_value = fpr_fields.get(9).unwrap_or(&"");
                if fpr_value.eq_ignore_ascii_case(&fingerprint) && capabilities.contains(&"e") {
                    return true;
                }
            }
        }
    }
    false
}

#[command]
pub async fn gpg_encrypt_buffer(data: Vec<u8>, recipient: String) -> Result<Vec<u8>, String> {
    use tokio::io::AsyncWriteExt;
    use tokio::process::Command as TokioCommand;

    let mut child = TokioCommand::new("gpg")
        .args([
            "--encrypt",
            "--recipient", &recipient,
            "--batch",
            "--yes",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(CREATE_NO_WINDOW) // 关键：隐藏cmd窗口
        .spawn()
        .map_err(|e| e.to_string())?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(&data).await.map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().await.map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(output.stdout)
}

#[command]
pub async fn gpg_decrypt_buffer(data: Vec<u8>) -> Result<Vec<u8>, String> {
    use tokio::io::AsyncWriteExt;
    use tokio::process::Command as TokioCommand;

    let mut child = TokioCommand::new("gpg")
        .args([
            "--decrypt",
            "--batch",
            "--yes",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(CREATE_NO_WINDOW) // 关键：隐藏窗口
        .spawn()
        .map_err(|e| e.to_string())?;

    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(&data).await.map_err(|e| e.to_string())?;
    }

    let output = child.wait_with_output().await.map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(output.stdout)
}