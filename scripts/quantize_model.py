"""
量化 ONNX 模型为 int8
"""
import os
from onnxruntime.quantization import quantize_dynamic, QuantType

model_dir = r"D:\claude\project\models\albert_chinese_small_sentiment"
onnx_path = os.path.join(model_dir, "model.onnx")
quantized_path = os.path.join(model_dir, "model-quantized.onnx")

print("=" * 50)
print("量化模型为 int8")
print("=" * 50)

if not os.path.exists(onnx_path):
    print(f"错误: {onnx_path} 不存在")
    exit(1)

orig_size = os.path.getsize(onnx_path)
print(f"原始大小: {orig_size/1024/1024:.2f} MB")

# 量化 (使用 QInt8)
quantize_dynamic(
    onnx_path,
    quantized_path,
    weight_type=QuantType.QInt8
)

quant_size = os.path.getsize(quantized_path)
print(f"量化后大小: {quant_size/1024/1024:.2f} MB")

# 如果量化成功，替换原始文件
if quant_size < orig_size:
    os.remove(onnx_path)
    os.rename(quantized_path, onnx_path)
    print(f"已替换为量化版本: {os.path.getsize(onnx_path)/1024/1024:.2f} MB")
else:
    print("量化后更大，保留原始文件")