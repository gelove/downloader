import { ComboboxForm } from "@/components/common/combobox";

export default function DownloadPage() {
  return (
    <ComboboxForm
      emptyMessage="无匹配选项, 输入用户主页链接并按回车键添加新用户"
      placeholder="输入用户名或主页链接，例如: www.douyin.com/user/......"
    />
  );
}
