use anyhow::Result;
use rustyscript::{import, json_args, Module, Runtime, RuntimeOptions, StaticModule};

const CRYPTO_MODULE: StaticModule =
    StaticModule::new("js/crypto-js.js", include_str!("../../js/crypto-js.js"));

pub fn get_xb(url_path: &str) -> Result<String> {
    let mut module = import("js/x-bogus.js")?;
    let value: String = module.call("getXB", json_args!(url_path))?;
    Ok(value)
}

pub fn get_xttp(url_path: &str) -> Result<String> {
    let mut runtime = Runtime::new(RuntimeOptions::default())?;
    let _ = runtime.load_module(&CRYPTO_MODULE.to_module())?;
    let xtt_handle = runtime.load_module(&Module::load("js/x-tt-params.js")?)?;
    let final_value: String =
        runtime.call_function(Some(&xtt_handle), "getXTTP", json_args!(url_path))?;
    Ok(final_value)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_xb() {
        let value =
            get_xb("/xg/path/?url=aid=6383%26sec_user_id=xxx%26max_cursor=0%26count=10").unwrap();
        print!("value: {}", value);
    }

    #[test]
    fn test_get_xtt_params() {
        let value = get_xttp("a=1&b=2&c=3").unwrap();
        print!("value: {}", value);
    }
}
