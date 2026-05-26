export const ShanhaiImageTo3DAdapter = {
  uploadImage: async (file) => ({ assetId: `asset_${Date.now()}`, fileName: file.name }),
  createTask: async (assetId) => ({ taskId: `MG3D-${assetId.slice(-6).toUpperCase()}` }),
  queryProgress: async () => ({ progress: 100, stage: '模型文件打包完成' }),
  getResult: async (taskId) => ({
    taskId,
    previewUrl: '',
    downloadUrl: '',
    formats: ['glb', 'usdz', 'fbx'],
  }),
  downloadResult: async () => new Blob(['Shanhai image-to-3D demo placeholder'], { type: 'model/gltf-binary' }),
  mapError: (code) => ({
    code,
    message: '演示版模拟了接口超时。真实接入后，这里会根据错误码映射为明确原因，例如格式不支持、上传失败、任务排队超时或生成服务异常。',
  }),
};
