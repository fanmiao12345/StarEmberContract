# v0.1 → v0.2 存档迁移

Web 本地存档会自动读取旧的 `starEmber.save.v1` 并迁移到 v2。

- `copies: 1` → `star:1, fragments:0`
- 重复数量 `copies - 1` 转换为碎片：R 每份 10、SR 每份 20、SSR 每份 40
- 新增 `revision`、`configVersion`
- 阵容仍保留，最多 5 人

迁移只发生在读取时，不需要手动改 JSON。
