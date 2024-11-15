use std::fs::File;
use std::io::{Read, Write};
use std::thread;
use tokio::time::Duration;

async fn download() -> Result<(), Box<dyn std::error::Error>> {
    // 要下载的文件列表
    let urls = vec![
        "https://example.com/file1.txt",
        "https://example.com/file2.txt",
        "https://example.com/file3.txt",
    ];

    // 创建一个tokio runtime
    let client = reqwest::Client::new();

    // 同时下载的最大文件数
    let max_concurrent_downloads = 3;
    let mut concurrent_downloads = Vec::new();

    for url in urls {
        // 等待直到有空闲下载槽位
        while concurrent_downloads.len() >= max_concurrent_downloads {
            tokio::time::sleep(Duration::from_secs(1)).await;
        }

        // 启动下载任务
        let client_clone = client.clone();
        let download_task = tokio::spawn(async move {
            download_file(&client_clone, url).await;
        });
        concurrent_downloads.push(download_task);
    }

    // 等待所有下载任务完成
    for download_task in concurrent_downloads {
        download_task.await?;
    }

    Ok(())
}

async fn download_file(client: &reqwest::Client, url: &str) {
    let response = client.get(url).send().await.unwrap();

    let filename = url.split("/").last().unwrap();
    let mut file = File::create(filename).unwrap();

    let mut body = response.bytes_stream();

    // while let Some(chunk) = body.next().await {
    //     let chunk = chunk.unwrap();
    //     file.write_all(&chunk).await.unwrap();
    // }

    println!("Downloaded: {}", filename);
}

async fn initiate_download(
    file_type: &str,
    file_url: &str,
    file_suffix: &str,
    base_path: &str,
    file_name: &str,
) -> () {
    /*
     * 初始化下载任务。如果文件已经存在，则跳过下载。否则，创建一个新的异步下载任务。
     *
     * Args:
     *     file_type (str): 文件类型描述，如“音乐”、“视频”或“封面”。
     *     file_url (str): 要下载的文件的URL。
     *     file_suffix (str): 文件的后缀名，如“.mp3”或“.mp4”。
     *     base_path (str): 文件保存的基础目录路径。
     *     file_name (str): 文件的主要名称，不包含后缀。
     *
     * Note:
     *     这个函数会检查文件是否已经在指定的路径存在。如果存在，跳过该任务。否则，将创建一个新的下载任务。
     */

    let filepath = format!("{}{}", file_name, file_suffix);
    let full_path = std::path::Path::new(base_path).join(filepath);
    // if std::path::Path::new(&full_path).exists() {
    //     let task_id = progress.add_task(description = format!("[  跳过  ]:"), filename = trim_filename(&filepath, 50), total = 1, completed = 1);
    //     progress.update(task_id, completed = 1);
    // } else {
    //     let task_id = progress.add_task(description = format!("[  {}  ]:", file_type), filename = trim_filename(&filepath, 50), start = false);
    //     let download_task = tokio::task::spawn_blocking(|| {
    //         download_file(task_id, file_url, full_path)
    //     });
    //     download_tasks.push(download_task);
    // }
}

fn download_thread() {
    let urls = vec![
        "https://example.com/file1.txt",
        "https://example.com/file2.txt",
        "https://example.com/file3.txt",
        // Add more URLs as needed
    ];

    for url in urls {
        let handle = thread::spawn(move || {
            // Download the file
            let mut response = reqwest::blocking::get(url).unwrap();
            let mut buffer = Vec::new();
            response.read_to_end(&mut buffer).unwrap();

            // Write the file to disk
            let mut file = File::create(format!("{}.txt", url)).unwrap();
            file.write_all(&buffer).unwrap();
        });

        // Wait for the thread to finish
        handle.join().unwrap();
    }
}
