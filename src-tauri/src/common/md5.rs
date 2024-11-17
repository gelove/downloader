use md5::{Digest, Md5};

pub fn encode(list: &[u8]) -> String {
    let mut hasher = Md5::new();
    hasher.update(list);
    format!("{:x}", hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encode() {
        let result = encode("123456".as_bytes());
        assert_eq!(result, "e10adc3949ba59abbe56e057f20f883e".to_string());
    }
}
