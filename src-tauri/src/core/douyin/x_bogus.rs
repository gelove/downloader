use chrono::prelude::*;
use std::vec::Vec;

use crate::common::md5;

pub struct XBogus {
    character: String,
}

impl XBogus {
    pub fn new() -> XBogus {
        XBogus {
            character: "Dkdpgh4ZKsQB80/Mfvw36XI1R25-WUAlEi7NLboqYTOPuzmFjJnryx9HVGcaStCe="
                .to_string(),
        }
    }

    // '0' => 0, 'a' => 10, 'A' => 10
    fn convert_u8(&self, v: u8) -> u8 {
        match v {
            // 0..2 => [0, 1] 左闭右开
            // 0..=2 => [0, 1, 2] 闭区间
            b'0'..=b'9' => v - b'0',
            b'a'..=b'f' => v - b'a' + 10,
            b'A'..=b'F' => v - b'A' + 10,
            _ => v,
        }
    }

    fn md5_str_to_array(&self, md5_str: &str) -> Vec<u8> {
        let mut result = Vec::new();
        if md5_str.len() != 32 {
            return md5_str.bytes().collect();
        }
        let bytes = md5_str.as_bytes();
        let mut idx = 0;
        while idx < md5_str.len() {
            let c1 = self.convert_u8(bytes[idx]);
            let c2 = self.convert_u8(bytes[idx + 1]);
            result.push((c1 << 4) | c2);
            idx += 2;
        }
        result
    }

    fn md5_encrypt(&self, url_path: &str) -> Vec<u8> {
        self.md5_str_to_array(&md5::encode(
            &self.md5_str_to_array(&md5::encode(&self.md5_str_to_array(url_path))),
        ))
    }

    fn encoding_conversion(&self, val: Vec<u8>) -> Vec<u8> {
        /*
        第一次编码转换
        Perform encoding conversion.
        */
        let res = match val.as_slice() {
            [a, b, c, e, d, t, f, r, n, o, i, g, x, u, s, l, v, h, p] => vec![
                *a, *i, *b, *g, *c, *x, *e, *u, *d, *s, *t, *l, *f, *v, *r, *h, *n, *p, *o,
            ],
            _ => panic!("Expected a vector of length 19"),
        };
        res
    }

    fn rc4_encrypt(&self, data: &[u8]) -> Vec<u8> {
        let key = 255;
        let mut s = (0..256).collect::<Vec<_>>();
        // 初始化 S 盒
        // Initialize the S box
        let mut j = 0;
        for i in 0..256 {
            j = (j + s[i] + key) % 256;
            s.swap(i, j);
        }

        // 生成密文
        // Generate the ciphertext
        let mut encrypted_data = Vec::new();
        let mut i = 0;
        let mut j = 0;
        for byte in data {
            i = (i + 1) % 256;
            j = (j + s[i]) % 256;
            s.swap(i, j);
            let encrypted_byte = byte ^ (s[(s[i] + s[j]) % 256] as u8);
            encrypted_data.push(encrypted_byte);
        }

        encrypted_data
    }

    fn calculation(&self, a1: u8, a2: u8, a3: u8) -> String {
        let x1 = (a1 as u32) << 16;
        let x2 = (a2 as u32) << 8;
        let x3 = x1 | x2 | (a3 as u32);
        let result = vec![
            self.character
                .chars()
                .nth(((x3 & 16515072) >> 18) as usize)
                .unwrap(),
            self.character
                .chars()
                .nth(((x3 & 258048) >> 12) as usize)
                .unwrap(),
            self.character
                .chars()
                .nth(((x3 & 4032) >> 6) as usize)
                .unwrap(),
            self.character.chars().nth((x3 & 63) as usize).unwrap(),
        ];
        result.into_iter().collect()
    }

    pub fn get_xbogus(self, url_path: &str) -> String {
        // 获取 X-Bogus 值。
        // Get the X-Bogus value.
        let array1 = self.md5_str_to_array("d88201c9344707acde7261b158656c0e");
        let array2 = self.md5_str_to_array(&md5::encode(
            &self.md5_str_to_array("d41d8cd98f00b204e9800998ecf8427e"),
        ));
        let url_path_array = self.md5_encrypt(url_path);
        let now = Utc::now();
        let timestamp = now.timestamp();
        // let timestamp = 1699882415;
        // println!("当前时间戳：{}", timestamp);
        let ct = 536919696_u32;
        let mut xb_ = "".to_string();
        let mut list = vec![
            64u8,
            0.00390625 as u8,
            1u8,
            8u8,
            url_path_array[14],
            url_path_array[15],
            array2[14],
            array2[15],
            array1[14],
            array1[15],
            (timestamp >> 24 & 255) as u8,
            (timestamp >> 16 & 255) as u8,
            (timestamp >> 8 & 255) as u8,
            (timestamp & 255) as u8,
            (ct >> 24 & 255) as u8,
            (ct >> 16 & 255) as u8,
            (ct >> 8 & 255) as u8,
            (ct & 255) as u8,
        ];

        let mut xor_result = list[0];
        let mut i = 0;
        for v in list.iter() {
            if i == 0 {
                i += 1;
                continue;
            }
            xor_result ^= *v;
        }
        list.push(xor_result);

        let mut array3 = vec![];
        let mut array4 = vec![];
        let mut idx = 0;
        while idx < list.len() {
            array3.push(list[idx]);
            if idx + 1 < list.len() {
                array4.push(list[idx + 1]);
            }
            idx += 2;
        }

        let mut new_array: Vec<u8> = Vec::with_capacity(19);
        new_array.extend(array3);
        new_array.extend(array4);

        let t1 = self.encoding_conversion(new_array);
        let t2 = self.rc4_encrypt(&t1);
        let mut bytes = vec![2_u8, 255_u8];
        bytes.extend(t2);
        let mut index = 0;
        while index < bytes.len() {
            xb_ += &self.calculation(bytes[index], bytes[index + 1], bytes[index + 2]);
            index += 3
        }
        format!("{}&X-Bogus={}", url_path, xb_)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_md5_encrypt() {
        let xb = XBogus::new();
        let res = xb.md5_encrypt("device_platform=webapp&aid=6383&sec_user_id=MS4wLjABAAAAB7geBosrrW1XPPqgd88hbbKF8fymijEvW5wTsq4qIK6mDkbb5Ycvl8_fxDrHCawy&cookie_enabled=true&platform=PC&downlink=10");
        assert_eq!(
            res,
            vec![13, 13, 131, 5, 251, 101, 30, 194, 78, 92, 222, 226, 42, 30, 191, 144]
        );
        println!("{:?}", res);
    }

    #[test]
    fn test_md5_str_to_array() {
        let xb = XBogus::new();
        let res1 = xb.md5_str_to_array("d88201c9344707acde7261b158656c0e");
        assert_eq!(
            res1,
            vec![216, 130, 1, 201, 52, 71, 7, 172, 222, 114, 97, 177, 88, 101, 108, 14]
        );
        let res2 = xb.md5_str_to_array(&md5::encode(
            &xb.md5_str_to_array("d41d8cd98f00b204e9800998ecf8427e"),
        ));
        assert_eq!(
            res2,
            vec![89, 173, 178, 78, 243, 205, 190, 2, 151, 240, 91, 57, 88, 39, 69, 63]
        );
    }

    #[test]
    fn test_encoding_conversion() {
        let xb = XBogus::new();
        let val = vec![
            64, 1, 191, 69, 108, 101, 13, 32, 190, 250, 0, 8, 144, 63, 14, 81, 179, 0, 144,
        ];
        let res = xb.encoding_conversion(val);
        println!("res => {:?}", res)
    }

    #[test]
    fn test_chars() {
        let character = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+=";
        let result = vec![
            character.chars().nth(2).unwrap(),
            character.chars().nth(4).unwrap(),
            character.chars().nth(8).unwrap(),
        ];
        println!("{:?}", result);
        let s: String = result.into_iter().collect();
        println!("{:?}", s);
    }

    #[test]
    fn test_encode() {
        // let bs = b'a';
        let bs = b'\xff';
        let s = 'ÿ';
        println!("{} {:?}", bs, s as u8);
    }

    #[test]
    fn test_rc4_encrypt() {
        let xb = XBogus::new();
        let bs = b"@\x00\x01\x08\xbf\x90E?l\x0eeQ\xdf\xd1 \x00\xbe\x90J";
        let res = xb.rc4_encrypt(bs);
        println!("{:#?}", res);
    }

    #[test]
    fn test_get_xbogus() {
        let xb = XBogus::new();
        let res = xb.get_xbogus("device_platform=webapp&aid=6383&sec_user_id=MS4wLjABAAAAB7geBosrrW1XPPqgd88hbbKF8fymijEvW5wTsq4qIK6mDkbb5Ycvl8_fxDrHCawy&cookie_enabled=true&platform=PC&downlink=10");
        // "device_platform=webapp&aid=6383&sec_user_id=MS4wLjABAAAAB7geBosrrW1XPPqgd88hbbKF8fymijEvW5wTsq4qIK6mDkbb5Ycvl8_fxDrHCawy&cookie_enabled=true&platform=PC&downlink=10&X-Bogus=DFSzswVurS0ANxXhtm-ijM9WX7jt"
        println!("res => {:?}", res);
    }
}
