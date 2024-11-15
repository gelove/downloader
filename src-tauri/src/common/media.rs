use std::process::Command;

pub fn process() {
    let output = Command::new("ffmpeg")
        .arg("-i")
        .arg("input.mp4")
        .arg("-vf")
        .arg("drawbox=y=ih/PHI:color=red@0.5:width=iw:height=ih")
        .arg("output.mp4")
        .output()
        .expect("Failed to execute command");

    println!("status: {}", output.status);
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process() {
        process()
    }
}
