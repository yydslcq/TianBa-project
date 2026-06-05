# 诺里斯式液态水波交互后续优化计划

> 状态：已归档，待后续空闲时执行。
>
> 暂停点：当前页面已经完成单 Three.js canvas、GLB 模型、离屏纹理和基础后处理折射。本计划不要求继续替换文物素材，下一阶段优先升级水体模拟。

## Summary

暂停继续换文物素材。保留现有 `container.glb` 青铜器模型，将当前“固定 visor 形状 + Canvas 2D 残影”升级为真正的 GPU 水体模拟。

目标不是复刻诺里斯网站的品牌元素，而是实现相近的高级交互体验：鼠标经过时形成连续、柔韧、有惯性的液态镜片，模型画面随水波发生折射，而不是出现一块跟随鼠标移动的色块。

## Current Baseline

当前 `src/sections/ReconstructionShowcase.jsx` 已具备：

- Three.js 加载 `public/home-assets/recon-container.glb`
- 单 canvas 渲染
- 离屏 `WebGLRenderTarget`
- 后处理 shader 折射模型画面
- 鼠标控制模型轻微旋转
- 移动端基础降级

当前不足：

- 水波由 Canvas 2D 绘制的固定轮廓驱动，形变仍像“预制镜片”
- 鼠标速度只影响少量涟漪，不足以形成自然水流
- 残影容易变成半透明罩层
- 水波缺少局部挤压、回弹和方向性

## Key Changes

### 1. 引入 GPU 水体模拟

将水波独立为 `src/sections/reconstruction/fluidSimulation.js`。

使用两个低分辨率 ping-pong `WebGLRenderTarget` 保存水体状态：

- `R`：水面高度
- `G`：垂直速度
- `B`：短暂高光残留
- `A`：预留

每帧根据相邻像素计算拉普拉斯扩散、回弹和阻尼，形成连续水波。桌面端模拟纹理限制在 `512px`，移动端限制在 `256px`，避免拖慢模型渲染。

### 2. 鼠标改为连续流体注入

移除固定可见的 `drawVisorPath()` 色块。

鼠标移动时记录：

- 平滑后的位置
- 上一帧位置
- 移动方向
- 移动速度
- 时间间隔

沿鼠标路径插值注入多个椭圆形 splat：

- 慢速移动：小范围、柔和折射
- 快速划动：更长的方向性水痕
- 停止移动：水波自然衰减，不突然消失
- 离开区域：保留短暂回弹后归于平静

### 3. 重写最终合成 shader

整理到 `src/sections/reconstruction/reconstructionShaders.js`。

最终合成保留现有 `tScene`，新增 `tFluid`：

- 根据水面高度梯度计算法线
- 用法线偏移模型纹理 UV，产生真实折射
- 仅在水波边缘加入轻微青绿色高光和极弱色散
- 删除大面积绿色雾层
- 限制最大折射强度，避免青铜器纹理撕裂

模型保持克制：水波是主角，青铜器只做轻微视差和缓慢呼吸式漂移。

### 4. 性能与降级

- 使用 `IntersectionObserver`：区块离开视口后暂停动画循环
- 页面切换到后台后暂停渲染
- `prefers-reduced-motion` 下禁用流体拖尾，只保留轻微折射
- 移动端默认缓慢自动漂移；触摸时生成小范围水波
- 清理 `base.css` 中已经废弃的旧 PNG 揭面样式和 `.recon-fx-canvas`

## Public Interface

新增内部工厂方法：

```js
createFluidSimulation(renderer, {
  width,
  height,
  mobile,
})
```

返回：

```js
{
  texture,
  resize(width, height, mobile),
  inject({ x, y, dx, dy, speed }),
  step(deltaTime),
  dispose(),
}
```

`ReconstructionShowcase` 只负责：

- 加载 GLB
- 记录指针
- 驱动流体模拟
- 渲染模型到离屏纹理
- 调用最终合成 shader

## Test Plan

- 运行 `npm run build`
- 打开 `http://127.0.0.1:5173/#cases`
- 桌面端录制 5 秒鼠标轨迹，验证：
  - 水波连续、柔韧、有惯性
  - 鼠标快速划过时没有断裂色块
  - 停止后水波自然衰减
  - 青铜器纹理不会被大面积撕裂
- 验证 `1440x980` 与 `390x844`：
  - canvas 非空
  - 无横向滚动
  - 移动端主体完整可见
- 检查控制台：
  - 无 shader 编译错误
  - 定位并清理现存无关 `404`
- 与用户提供的诺里斯录屏和 rebuild 录屏并排比较，重点判断流体惯性、边缘质感和跟手程度。

## Assumptions

- 本轮后续工作只优化水波交互，不继续替换青铜器素材。
- 使用用户提供的 `container.glb`。
- 不复制诺里斯网站的 GLB、HDR、Rive 或品牌资产。
- 不引入新的动画库；继续基于 Three.js 和自定义 shader 实现。

