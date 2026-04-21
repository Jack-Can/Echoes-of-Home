"""
进一步量化模型为 Q4 (4位权重)
使用更激进的量化设置
"""
import os

model_dir = r"D:\claude\project\models\albert_chinese_small_sentiment"
onnx_path = os.path.join(model_dir, "model.onnx")
quantized_path = os.path.join(model_dir, "model-q4.onnx")

print("=" * 50)
print("尝试 Q4 量化")
print("=" * 50)

# 尝试使用onnxslim或其他工具
# 先检查是否有onnxslim
try:
    import onnxslim
    print("使用 onnxslim 优化...")
except ImportError:
    print("onnxslim 未安装，尝试其他方法")

# 直接使用更小的量化范围
from onnxruntime.quantization import quantize_dynamic, QuantType

orig_size = os.path.getsize(onnx_path)
print(f"当前大小: {orig_size/1024/1024:.2f} MB")

# 尝试 QInt4 量化
try:
    quantize_dynamic(
        onnx_path,
        quantized_path,
        weight_type=QuantType.QInt4
    )
    quant_size = os.path.getsize(quantized_path)
    print(f"Q4 量化后大小: {quant_size/1024/1024:.2f} MB")
    
    if quant_size < orig_size:
        os.remove(onnx_path)
        os.rename(quantized_path, onnx_path)
        print(f"已替换为 Q4 版本: {os.path.getsize(onnx_path)/1024/1024:.2f} MB")
except Exception as e:
    print(f"Q4 量化失败: {e}")
    print("尝试其他优化方法...")

# 如果还是太大，尝试直接优化
print("\n尝试 ONNX 优化...")
from onnx import convert_model
import onnx

# 先加载模型
model = onnx.load(onnx_path)

# 检查模型大小
print(f"模型节点数: {len(model.graph.node)}")