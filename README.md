# 🎮 Scratch HTML Clone

<div align="center">

![Scratch Clone Logo](https://img.shields.io/badge/Scratch-Clone-orange?style=for-the-badge&logo=scratch)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

一个功能丰富的Scratch可视化编程环境克隆版本，使用纯HTML、CSS、JavaScript构建

[🚀 在线演示](https://let5sne.github.io/my-scratch) | [📖 功能清单](功能清单.md) | [🔧 开发文档](CLAUDE.md)

</div>

---

## ✨ 项目特色

### 🎯 核心功能
- 🧩 **包裹型积木系统** - 支持嵌套的重复、循环、条件判断积木
- 🎛️ **可编辑参数** - 所有积木参数都可自定义（时间、坐标、文本等）
- 🎮 **直观拖拽操作** - 流畅的拖拽体验，支持拖回删除
- ⚡ **高性能优化** - 使用requestAnimationFrame和GPU加速
- 📱 **响应式设计** - 完美适配桌面、平板、手机

### 🎨 视觉体验
- 🌈 **分类配色系统** - 运动(绿)、外观(紫)、事件(橙)、控制(红)
- ✨ **丰富动画效果** - 角色移动、旋转、缩放、对话气泡
- 🎭 **实时视觉反馈** - 拖拽高亮、删除区域指示、执行状态显示

## 🎮 功能演示

### 积木类型
| 分类 | 积木 | 功能描述 |
|------|------|----------|
| 🟢 运动 | 移动、旋转 | 控制角色位置和方向 |
| 🟢 运动 | 移动到指定位置 | 精确坐标控制 |
| 🟢 运动 | 滑行积木 | 平滑动画移动 |
| 🟣 外观 | 说话、显示/隐藏 | 角色对话和可见性 |
| 🟣 外观 | 自定义说话 | 可编辑内容和时长 |
| 🟣 外观 | 改变大小 | 角色缩放效果 |
| 🟠 事件 | 点击事件、绿旗事件 | 程序触发机制 |
| 🔴 控制 | 等待、重复、条件判断 | 程序流程控制 |

### 🎬 动画效果
- **角色移动** - 平滑的位置变化动画
- **旋转效果** - 角色方向改变动画
- **对话气泡** - 带尾巴的对话框动画
- **删除动画** - 360度旋转缩小消失效果

## 🚀 快速开始

### 📋 系统要求
- 现代浏览器（Chrome 60+, Firefox 55+, Safari 12+, Edge 79+）
- 支持ES6+和CSS3特性
- 建议屏幕分辨率：1024x768或更高

### 🔧 安装运行

#### 方法一：直接运行
```bash
# 克隆项目
git clone https://github.com/let5sne/my-scratch.git

# 进入项目目录
cd my-scratch

# 使用任意HTTP服务器运行
# 例如使用Python:
python -m http.server 8000

# 或使用Node.js:
npx serve .

# 然后访问 http://localhost:8000
```

#### 方法二：直接打开
```bash
# 直接用浏览器打开index.html文件
open index.html  # macOS
start index.html # Windows
```

### 🎯 基本使用

1. **创建积木** - 从左侧积木类别拖拽到中间工作区
2. **编辑参数** - 点击积木中的输入框修改数值或文本
3. **嵌套积木** - 将积木拖拽到容器型积木内部
4. **运行程序** - 点击绿旗或运行按钮执行程序
5. **删除积木** - 拖回左侧区域、右键菜单或使用Delete键

## 🎮 操作指南

### ⌨️ 键盘快捷键
| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + Enter` | 运行程序 |
| `Ctrl/Cmd + .` | 停止程序 |
| `Delete/Backspace` | 删除选中积木 |

### 🖱️ 鼠标操作
| 操作 | 功能 |
|------|------|
| 拖拽积木 | 创建或移动积木 |
| 拖回积木区 | 删除积木（需确认） |
| 右键积木 | 显示删除菜单 |
| 点击积木 | 选中积木 |

## 🏗️ 项目架构

### 📁 文件结构
```
my-scratch/
├── index.html          # 🌐 主界面文件
├── style.css           # 🎨 样式文件
├── script.js           # ⚙️ 核心逻辑文件
├── CLAUDE.md           # 📖 开发文档
├── 功能清单.md         # 📋 功能清单
└── README.md           # 📖 项目说明
```

### 🔧 核心组件
- **ScratchClone** - 主应用程序类，管理界面和交互
- **BlockConnection** - 积木连接系统，处理积木关系
- **拖拽系统** - 高性能拖拽引擎
- **执行引擎** - 积木程序解释执行器
- **动画系统** - 角色动画和效果管理

## 🎯 技术特性

### ⚡ 性能优化
- **requestAnimationFrame** - 流畅60fps拖拽动画
- **GPU加速** - 使用CSS transform提升渲染性能
- **事件节流** - 防止过度频繁的DOM操作
- **内存管理** - 自动清理事件监听器和动画帧

### 📱 响应式设计
- **自适应布局** - 支持不同屏幕尺寸
- **触摸优化** - 完整支持移动设备操作
- **弹性网格** - 智能调整组件大小

## 🔮 未来规划

### 🚧 开发中功能
- [ ] 多角色支持
- [ ] 声音播放系统
- [ ] 项目保存/加载
- [ ] 更多积木类型

### 💡 功能建议
- [ ] 代码导出功能
- [ ] 积木搜索
- [ ] 变量系统
- [ ] 函数定义
- [ ] 画笔绘图
- [ ] 碰撞检测

## 🤝 贡献指南

### 🔧 开发环境
```bash
# 克隆项目
git clone https://github.com/let5sne/my-scratch.git

# 本地开发
cd my-scratch

# 推荐使用Live Server插件进行开发
# 或使用任意HTTP服务器
```

### 📝 贡献流程
1. Fork 项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 🐛 问题报告
如果发现问题，请[创建Issue](https://github.com/let5sne/my-scratch/issues)并包含：
- 问题描述
- 复现步骤
- 浏览器版本
- 屏幕截图（如需要）

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) - 查看文件了解详情

## 🙏 致谢

- **Scratch** - 感谢MIT媒体实验室的Scratch项目提供灵感
- **Claude Code** - 感谢AI辅助开发工具的支持
- **开源社区** - 感谢所有提供帮助和建议的开发者

---

<div align="center">

**[⭐ Star](https://github.com/let5sne/my-scratch) 这个项目如果它对你有帮助！**

Made with ❤️ by [let5sne](https://github.com/let5sne)

🤖 Generated with [Claude Code](https://claude.ai/code)

</div>