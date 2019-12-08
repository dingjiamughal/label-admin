# label-admin

## step
数据集上传 -> 数据修正 -> 模型预测

### step1 上传
- 读取csv下载图片
- 成功后显示所有数据
#### 数据集上传
上传csv，一个csv为一个数据集
- 数据补充：上传一个全新，根据datasetid匹配插入
- 数据修改：
#### 图片下载规则
读取public/images/task名/，csv中项存在`此文件中` => 不用下载
#### pipeline
- 图片上传进度
- 去除exif
- 模型预测

### step2 审核
- 标注审核
- 图片旋转角度修正
- 导出csv
