use std::collections::HashMap;

/// 根据配置文件的全局格式化文件名
/// Format file name according to the global conf file
pub fn format_file_name(
    naming_template: &str,
    aweme_data: &HashMap<String, String>,
    custom_fields: &HashMap<String, String>,
) -> String {
    let mut file_name = naming_template.to_string();

    // 替换 aweme_data 中的字段
    for (key, value) in aweme_data {
        let placeholder = format!("{{{{{}}}}}", key);
        file_name = file_name.replace(&placeholder, value);
    }

    // 替换 custom_fields 中的字段
    for (key, value) in custom_fields {
        let placeholder = format!("{{{{{}}}}}", key);
        file_name = file_name.replace(&placeholder, value);
    }

    file_name
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_format_file_name() {
        let mut aweme_data = HashMap::new();
        aweme_data.insert("id".to_string(), "123".to_string());

        let mut custom_fields = HashMap::new();
        custom_fields.insert("type".to_string(), "video".to_string());

        let naming_template = "file_{{id}}_{{type}}.txt";
        let file_name = format_file_name(naming_template, &aweme_data, &custom_fields);
        println!("生成的文件名: {}", file_name);
    }
}
