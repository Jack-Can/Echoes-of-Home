"""
下载并转换 voidful/albert_chinese_small_sentiment 模型为 ONNX 格式
"""
import os

model_dir = r"D:\claude\project\models\albert_chinese_small_sentiment"
os.makedirs(model_dir, exist_ok=True)

from optimum.onnxruntime import ORTModelForSequenceClassification
from transformers import AutoTokenizer

model_name = "voidful/albert_chinese_small_sentiment"
output_path = model_dir

print("=" * 50)
print("下载模型并导出为 ONNX 格式")
print("=" * 50)

# 下载并导出模型
print("正在下载模型...")
model = ORTModelForSequenceClassification.from_pretrained(
    model_name,
    export=True
)

print("正在保存为 ONNX 格式...")
model.save_pretrained(output_path)

# 保存 tokenizer
print("正在保存 tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(model_name)
tokenizer.save_pretrained(output_path)

print("\n生成的文件:")
for f in os.listdir(output_path):
    fpath = os.path.join(output_path, f)
    if os.path.isfile(fpath):
        size = os.path.getsize(fpath)
        print(f"  {f} - {size/1024:.1f} KB")

total_size = sum(os.path.getsize(os.path.join(output_path, f)) 
                 for f in os.listdir(output_path) 
                 if os.path.isfile(os.path.join(output_path, f)))
print(f"\n模型总大小: {total_size/1024/1024:.2f} MB")