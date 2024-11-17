use std::fmt::Debug;

use chrono::Utc;
use rand::Rng;
use serde_json::json;

use crate::common::sm3;
use crate::config::CONFIG;

pub struct StringProcessor;

impl StringProcessor {
    pub fn from_char_code<T: Into<u32> + Debug>(arr: Vec<T>) -> String {
        arr.into_iter()
            .filter_map(|c| std::char::from_u32(c.into()))
            .collect()
    }

    pub fn generate_byte_sequence(rd: u32) -> Vec<u32> {
        let mut rd = rd;
        if rd == 0 {
            let mut rng = rand::thread_rng();
            rd = rng.gen_range(0..10000u32);
        }

        let mut result = Vec::new();
        result.push((rd & 255) & 170 | 1);
        result.push((rd & 255) & 85 | 2);
        result.push(((rd >> 8) & 170) | 5);
        result.push(((rd >> 8) & 85) | 40);
        result
    }

    pub fn generate_random_bytes(list: [u32; 3]) -> String {
        let mut result: Vec<u32> = Vec::new();
        for v in list {
            result.extend(Self::generate_byte_sequence(v));
        }
        Self::from_char_code(result)
    }
}

struct CryptoUtility {
    base64_alphabet: Vec<String>,
}

impl CryptoUtility {
    const BIG_ARRAY: &[u8] = &[
        121, 243, 55, 234, 103, 36, 47, 228, 30, 231, 106, 6, 115, 95, 78, 101, 250, 207, 198, 50,
        139, 227, 220, 105, 97, 143, 34, 28, 194, 215, 18, 100, 159, 160, 43, 8, 169, 217, 180,
        120, 247, 45, 90, 11, 27, 197, 46, 3, 84, 72, 5, 68, 62, 56, 221, 75, 144, 79, 73, 161,
        178, 81, 64, 187, 134, 117, 186, 118, 16, 241, 130, 71, 89, 147, 122, 129, 65, 40, 88, 150,
        110, 219, 199, 255, 181, 254, 48, 4, 195, 248, 208, 32, 116, 167, 69, 201, 17, 124, 125,
        104, 96, 83, 80, 127, 236, 108, 154, 126, 204, 15, 20, 135, 112, 158, 13, 1, 188, 164, 210,
        237, 222, 98, 212, 77, 253, 42, 170, 202, 26, 22, 29, 182, 251, 10, 173, 152, 58, 138, 54,
        141, 185, 33, 157, 31, 252, 132, 233, 235, 102, 196, 191, 223, 240, 148, 39, 123, 92, 82,
        128, 109, 57, 24, 38, 113, 209, 245, 2, 119, 153, 229, 189, 214, 230, 174, 232, 63, 52,
        205, 86, 140, 66, 175, 111, 171, 246, 133, 238, 193, 99, 60, 74, 91, 225, 51, 76, 37, 145,
        211, 166, 151, 213, 206, 0, 200, 244, 176, 218, 44, 184, 172, 49, 216, 93, 168, 53, 21,
        183, 41, 67, 85, 224, 155, 226, 242, 87, 177, 146, 70, 190, 12, 162, 19, 137, 114, 25, 165,
        163, 192, 23, 59, 9, 94, 179, 107, 35, 7, 142, 131, 239, 203, 149, 136, 61, 249, 14, 156,
    ];

    const SALT: &str = "cus";
    const CHARACTER: &str = "Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe";
    const CHARACTER2: &str = "ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe";

    fn new() -> Self {
        CryptoUtility {
            base64_alphabet: vec![Self::CHARACTER.to_string(), Self::CHARACTER2.to_string()],
        }
    }

    fn process_param(&self, param: &str, add_salt: bool) -> String {
        if add_salt {
            format!("{}{}", param, Self::SALT)
        } else {
            param.to_string()
        }
    }

    fn hash_with_salt(&self, param: &str, add_salt: bool) -> Vec<u8> {
        let processed_param = self.process_param(param, add_salt);
        sm3::hash(processed_param)
    }

    fn hash(&self, param: &[u8]) -> Vec<u8> {
        sm3::hash(param)
    }

    fn transform_bytes(&self, bytes_list: &[u32]) -> String {
        let bytes_str = StringProcessor::from_char_code(bytes_list.to_vec());
        let mut big_array = Self::BIG_ARRAY.to_vec();
        let big_array_len = big_array.len();
        let mut result: Vec<char> = vec![];
        let mut result2: Vec<u32> = vec![];
        let mut index_b = big_array[1] as usize;
        let mut initial_value = 0;
        let mut value_e = 0;

        for (index, char) in bytes_str.chars().enumerate() {
            let mut sum_initial;

            if index == 0 {
                initial_value = big_array[index_b] as usize;
                sum_initial = index_b + initial_value;

                big_array[1] = initial_value as u8;
                big_array[index_b] = index_b as u8;
            } else {
                sum_initial = initial_value + value_e;
            }

            let char_value = char as u32;
            sum_initial = sum_initial % big_array_len;
            let value_f = big_array[sum_initial] as u32;
            let encrypted_char = char_value ^ value_f;
            result2.push(encrypted_char);
            result.push(std::char::from_u32(encrypted_char).unwrap_or_default());

            value_e = big_array[(index + 2) % big_array_len] as usize;
            sum_initial = (index_b + value_e as usize) % big_array_len;
            initial_value = big_array[sum_initial] as usize;
            big_array[sum_initial] = big_array[(index + 2) % big_array_len];
            big_array[(index + 2) % big_array_len] = initial_value as u8;
            index_b = sum_initial;
        }
        // println!("result2 => {:?}", result2);
        result.into_iter().collect()
    }

    fn abogus_encode(&self, abogus_bytes_str: &str, selected_alphabet: usize) -> String {
        let mut abogus = Vec::new();
        let abogus_chars = abogus_bytes_str.chars().collect::<Vec<char>>();
        let abogus_bytes_len = abogus_chars.len();
        // println!("abogus_bytes_len => {}", abogus_bytes_len);

        for i in (0..abogus_bytes_len).step_by(3) {
            let n = if i + 2 < abogus_bytes_len {
                (abogus_chars[i] as u32) << 16
                    | (abogus_chars[i + 1] as u32) << 8
                    | abogus_chars[i + 2] as u32
            } else if i + 1 < abogus_bytes_len {
                (abogus_chars[i] as u32) << 16 | (abogus_chars[i + 1] as u32) << 8
            } else {
                (abogus_chars[i] as u32) << 16
            };

            for (j, k) in [(18, 0xFC0000), (12, 0x03F000), (6, 0x0FC0), (0, 0x3F)] {
                if j == 6 && i + 1 >= abogus_bytes_len {
                    break;
                }
                if j == 0 && i + 2 >= abogus_bytes_len {
                    break;
                }
                abogus.push(
                    self.base64_alphabet[selected_alphabet]
                        .chars()
                        .nth(((n & k) >> j) as usize)
                        .unwrap_or_default(),
                );
            }
        }

        let padding = "=".repeat((4 - abogus.len() % 4) % 4);
        format!("{}{}", abogus.into_iter().collect::<String>(), padding)
    }

    // fn base64_encode(&self, input_string: &str, selected_alphabet: usize) -> String {
    //     let binary_string: String = input_string
    //         .chars()
    //         .flat_map(|c| format!("{:08b}", c as u8).chars().collect::<Vec<char>>())
    //         .collect();

    //     let padding_length = (6 - binary_string.len() % 6) % 6;
    //     let padded_binary = format!("{}{}", binary_string, "0".repeat(padding_length));

    //     let base64_indices: Vec<usize> = padded_binary
    //         .chars()
    //         .collect::<Vec<char>>()
    //         .chunks(6)
    //         .map(|chunk| {
    //             usize::from_str_radix(&chunk.iter().collect::<String>(), 2).unwrap_or_default()
    //         })
    //         .collect();

    //     let output_string: String = base64_indices
    //         .iter()
    //         .map(|&index| {
    //             self.base64_alphabet[selected_alphabet]
    //                 .chars()
    //                 .nth(index)
    //                 .unwrap_or_default()
    //         })
    //         .collect();

    //     format!("{}{}", output_string, "=".repeat(padding_length / 2))
    // }

    // fn rc4_encrypt(key: &[u8], plaintext: &str) -> Vec<u8> {
    //     let mut s = (0..=255u8).collect::<Vec<_>>();
    //     let mut j = 0;
    //     for i in 0..256 {
    //         j = (j + s[i] as usize + key[i % key.len()] as usize) % 256;
    //         s.swap(i, j);
    //     }

    //     let mut i = 0;
    //     let mut j = 0;
    //     let mut cipher_text = Vec::new();
    //     for char in plaintext.chars() {
    //         i = (i + 1) % 256;
    //         j = (j + s[i] as usize) % 256;
    //         s.swap(i, j);
    //         let k = s[(s[i] as usize + s[j] as usize) % 256];
    //         cipher_text.push(char as u8 ^ k);
    //     }

    //     cipher_text
    // }

    // fn rc4_encrypt(plaintext: &str) -> String {
    //     // RC4 加密算法实现
    //     let mut rc4 = Rc4::new(b"y".into());
    //     let mut data = plaintext.as_bytes().to_vec();
    //     rc4.apply_keystream(&mut data);
    //     // println!("{:?}", data);
    //     // 将 vec 转换为字符串
    //     let result = Self::from_char_code(data);
    //     result
    // }
}

pub enum BrowserType {
    Safari,
    Chrome,
    Firefox,
    Edge,
}

pub struct BrowserFingerprintGenerator;

impl BrowserFingerprintGenerator {
    pub fn generate(browser_type: BrowserType) -> String {
        let platform = match browser_type {
            BrowserType::Safari => "MacIntel",
            _ => "Win32",
        };
        let mut rng = rand::thread_rng();
        let inner_width = rng.gen_range(1024..1921);
        let inner_height = rng.gen_range(768..1081);
        let outer_width = inner_width + rng.gen_range(24..33);
        let outer_height = inner_height + rng.gen_range(75..91);
        let screen_x = 0;
        let screen_y = if rng.gen_bool(0.5) { 0 } else { 30 };
        let avail_width = rng.gen_range(1280..1921);
        let avail_height = rng.gen_range(800..1081);

        format!(
            "{}|{}|{}|{}|{}|{}|0|0|{}|{}|{}|{}|{}|{}|24|24|{}",
            inner_width,
            inner_height,
            outer_width,
            outer_height,
            screen_x,
            screen_y,
            avail_width,
            avail_height,
            avail_width,
            avail_height,
            inner_width,
            inner_height,
            platform
        )
    }
}

pub struct ABogus {
    aid: u32,
    page_id: u32,
    options: Vec<u32>,
    crypto: CryptoUtility,
    user_agent: String,
    browser_fp: String,
    sort_index: Vec<usize>,
    sort_index_2: Vec<usize>,
}

impl ABogus {
    pub fn new(fp: Option<String>, user_agent: Option<String>) -> Self {
        let aid = 6383;
        let page_id = 0;
        let options = vec![0, 1, 14];
        let crypto = CryptoUtility::new();
        let cfg = CONFIG.read().douyin.clone();
        let user_agent = user_agent.unwrap_or_else(|| cfg.headers.user_agent.clone());
        let browser_fp =
            fp.unwrap_or_else(|| BrowserFingerprintGenerator::generate(BrowserType::Edge));
        let sort_index = vec![
            18, 20, 52, 26, 30, 34, 58, 38, 40, 53, 42, 21, 27, 54, 55, 31, 35, 57, 39, 41, 43, 22,
            28, 32, 60, 36, 23, 29, 33, 37, 44, 45, 59, 46, 47, 48, 49, 50, 24, 25, 65, 66, 70, 71,
        ];
        let sort_index_2 = vec![
            18, 20, 26, 30, 34, 38, 40, 42, 21, 27, 31, 35, 39, 41, 43, 22, 28, 32, 36, 23, 29, 33,
            37, 44, 45, 46, 47, 48, 49, 50, 24, 25, 52, 53, 54, 55, 57, 58, 59, 60, 65, 66, 70, 71,
        ];

        ABogus {
            aid,
            page_id,
            options,
            crypto,
            user_agent,
            browser_fp,
            sort_index,
            sort_index_2,
        }
    }

    fn abogus_encode(&self, data: &str, alphabet_index: usize) -> String {
        self.crypto.abogus_encode(data, alphabet_index)
    }

    pub fn generate_abogus(&self, params: &str, request_type: &str) -> (String, String, String) {
        let mut ab_dir = json!({
            "8": 3,
            "15": {
                "aid": self.aid,
                "pageId": self.page_id,
                "boe": false,
                "ddrt": 7,
                "paths": {
                    "include": vec![json!({}); 7],
                    "exclude": Vec::<String>::new(),
                },
                "track": {
                    "mode": 0,
                    "delay": 300,
                    "paths": Vec::<String>::new(),
                },
                "dump": true,
                "rpU": "",
            },
            "18": 44,
            "19": [1, 0, 1, 5],
            "66": 0,
            "69": 0,
            "70": 0,
            "71": 0,
        });

        let start_encryption = Utc::now().timestamp_millis();
        // let start_encryption: i64 = 1727107820067;

        let array1 = self.crypto.hash(&self.crypto.hash_with_salt(params, true));
        // println!("array1 => {:?}", array1);

        let array2 = self
            .crypto
            .hash(&self.crypto.hash_with_salt(request_type, true));
        // println!("array2 => {:?}", array2);

        let array3 = vec![
            212, 61, 87, 195, 104, 163, 124, 28, 92, 126, 187, 53, 218, 38, 254, 253, 252, 73, 83,
            197, 194, 142, 113, 37, 9, 67, 166, 36, 56, 72, 56, 64,
        ];

        let end_encryption = Utc::now().timestamp_millis();
        // let end_encryption: i64 = 1727107820071;

        ab_dir["20"] = json!((start_encryption >> 24) & 255);
        ab_dir["21"] = json!((start_encryption >> 16) & 255);
        ab_dir["22"] = json!((start_encryption >> 8) & 255);
        ab_dir["23"] = json!(start_encryption & 255);
        ab_dir["24"] = json!((start_encryption / 256 / 256 / 256 / 256) as u64);
        ab_dir["25"] = json!((start_encryption / 256 / 256 / 256 / 256 / 256) as u64);

        ab_dir["26"] = json!((self.options[0] >> 24) & 255);
        ab_dir["27"] = json!((self.options[0] >> 16) & 255);
        ab_dir["28"] = json!((self.options[0] >> 8) & 255);
        ab_dir["29"] = json!(self.options[0] & 255);

        ab_dir["30"] = json!((self.options[1] / 256) & 255);
        ab_dir["31"] = json!((self.options[1] % 256) & 255);
        ab_dir["32"] = json!((self.options[1] >> 24) & 255);
        ab_dir["33"] = json!((self.options[1] >> 16) & 255);

        ab_dir["34"] = json!((self.options[2] >> 24) & 255);
        ab_dir["35"] = json!((self.options[2] >> 16) & 255);
        ab_dir["36"] = json!((self.options[2] >> 8) & 255);
        ab_dir["37"] = json!(self.options[2] & 255);

        ab_dir["38"] = json!(array1[21]);
        ab_dir["39"] = json!(array1[22]);
        ab_dir["40"] = json!(array2[21]);
        ab_dir["41"] = json!(array2[22]);
        ab_dir["42"] = json!(array3[23]);
        ab_dir["43"] = json!(array3[24]);

        ab_dir["44"] = json!((end_encryption >> 24) & 255);
        ab_dir["45"] = json!((end_encryption >> 16) & 255);
        ab_dir["46"] = json!((end_encryption >> 8) & 255);
        ab_dir["47"] = json!(end_encryption & 255);
        ab_dir["48"] = ab_dir["8"].clone();
        ab_dir["49"] = json!((end_encryption / 256 / 256 / 256 / 256) as u64);
        ab_dir["50"] = json!((end_encryption / 256 / 256 / 256 / 256 / 256) as u64);

        ab_dir["51"] = json!((self.page_id >> 24) & 255);
        ab_dir["52"] = json!((self.page_id >> 16) & 255);
        ab_dir["53"] = json!((self.page_id >> 8) & 255);
        ab_dir["54"] = json!(self.page_id & 255);
        ab_dir["55"] = json!(self.page_id);
        ab_dir["56"] = json!(self.aid);
        ab_dir["57"] = json!(self.aid & 255);
        ab_dir["58"] = json!((self.aid >> 8) & 255);
        ab_dir["59"] = json!((self.aid >> 16) & 255);
        ab_dir["60"] = json!((self.aid >> 24) & 255);

        ab_dir["64"] = json!(self.browser_fp.len());
        ab_dir["65"] = json!(self.browser_fp.len());
        // println!("ab_dir => {}", ab_dir.to_string());

        let sorted_values: Vec<u32> = self
            .sort_index
            .iter()
            .map(|&i| ab_dir[i.to_string()].as_u64().unwrap_or(0) as u32)
            .collect();
        // println!("sorted_values => {:?}", sorted_values);

        let edge_fp_array: Vec<u32> = self.browser_fp.bytes().map(|b| b as u32).collect();
        // println!("self.browser_fp => {:?}", self.browser_fp);
        // println!("edge_fp_array => {:?}", edge_fp_array);

        // attempt to shift right by `8_u8`, which would overflow
        // let mut ab_xor = ((self.browser_fp.len() & 255) as u8) >> 8u8 & 255u8;
        let mut ab_xor: u32 = 0;

        for index in 0..self.sort_index_2.len() - 1 {
            if index == 0 {
                ab_xor = ab_dir[self.sort_index_2[index].to_string()]
                    .as_u64()
                    .unwrap_or(0) as u32;
            }
            ab_xor ^= ab_dir[self.sort_index_2[index + 1].to_string()]
                .as_u64()
                .unwrap_or(0) as u32;
        }

        let mut sorted_values_extended = sorted_values;
        sorted_values_extended.extend_from_slice(&edge_fp_array);
        sorted_values_extended.push(ab_xor);
        // println!("sorted_values_extended: {:?}", sorted_values_extended);

        let random_bytes = StringProcessor::generate_random_bytes([0, 0, 0]);
        // println!("random_bytes => {:?}", random_bytes);
        let transform_bytes = self.crypto.transform_bytes(&sorted_values_extended);
        // println!("transform_bytes: {:?}", transform_bytes);

        let abogus_bytes_str = format!(
            "{}{}",
            // StringProcessor::generate_random_bytes(3),
            // self.crypto.transform_bytes(&sorted_values_extended)
            random_bytes,
            transform_bytes
        );
        // println!("abogus_bytes_str => {}", abogus_bytes_str);

        // let abogus_bytes_str = "hello world".to_string();
        let abogus = self.abogus_encode(&abogus_bytes_str, 0);
        let params_with_abogus = format!("{}&a_bogus={}", params, abogus);

        (params_with_abogus, abogus, self.user_agent.clone())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_random_bytes() {
        let result = StringProcessor::generate_random_bytes([100, 200, 300]);
        println!("random_bytes => {}", result);
    }

    #[test]
    fn test_params_to_array() {
        let crypto = CryptoUtility::new();
        let data = "hello world";
        let result = crypto.hash_with_salt(data, false);
        println!("result => {:x?}", result);
    }

    #[test]
    fn test_transform_bytes() {
        let sorted_values: Vec<u32> = vec![
            44, 31, 0, 0, 0, 0, 24, 66, 251, 0, 37, 165, 0, 0, 0, 1, 0, 239, 100, 167, 9, 234, 0,
            0, 0, 0, 35, 0, 0, 14, 31, 165, 0, 234, 39, 3, 402, 1, 402, 1, 67, 0, 0, 0, 49, 54, 53,
            57, 124, 57, 50, 55, 124, 49, 54, 56, 55, 124, 49, 48, 48, 57, 124, 48, 124, 48, 124,
            48, 124, 48, 124, 49, 54, 57, 52, 124, 49, 48, 50, 57, 124, 49, 54, 57, 52, 124, 49,
            48, 50, 57, 124, 49, 54, 53, 57, 124, 57, 50, 55, 124, 50, 52, 124, 50, 52, 124, 87,
            105, 110, 51, 50, 198,
        ];
        let crypto = CryptoUtility::new();
        let result = crypto.transform_bytes(&sorted_values);
        println!("result => {}", result);
    }

    #[test]
    fn test_abogus_encode() {
        let crypto = CryptoUtility::new();
        let data = "hello world";
        let result = crypto.abogus_encode(data, 0);
        println!("result => {}", result);
    }

    #[test]
    fn test_generate_abogus() {
        let params = "device_platform=webapp&aid=6383&channel=channel_pc_web&aweme_id=7380308675841297704&update_version_code=170400&pc_client_type=1&version_code=190500&version_name=19.5.0&cookie_enabled=true&screen_width=1920&screen_height=1080&browser_language=zh-CN&browser_platform=Win32&browser_name=Edge&browser_version=125.0.0.0&browser_online=true&engine_name=Blink&engine_version=125.0.0.0&os_name=Windows&os_version=10&cpu_core_num=12&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=50&webid=7376294349792396827";
        let request = "GET";
        let chrome_fp = BrowserFingerprintGenerator::generate(BrowserType::Chrome);
        // let chrome_fp =
        //     "1659|927|1687|1009|0|0|0|0|1694|1029|1694|1029|1659|927|24|24|Win32".to_string();
        // let start_encryption = 1727107820067;
        // let end_encryption = 1727107820071;
        let abogus = ABogus::new(Some(chrome_fp), None);
        let result = abogus.generate_abogus(params, request);
        println!("{:?}", result);
    }
}
