use sm3::{Digest, Sm3};

pub fn hash<T: AsRef<[u8]>>(data: T) -> Vec<u8> {
    let mut hasher = Sm3::new();
    hasher.update(data);
    let result = hasher.finalize();
    result.to_vec()
}

#[cfg(test)]
mod tests {
    use super::*;
    use hex_literal::hex;

    #[test]
    fn test_hash() {
        let data = b"hello world";
        let result = hash(data);
        print!("result: {:x?}", result);
        assert_eq!(
            result,
            hex!("44f0061e69fa6fdfc290c494654a05dc0c053da7e5c52b84ef93a9d67d3fff88")
        );
    }
}
