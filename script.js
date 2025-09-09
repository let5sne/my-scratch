// Scratch HTML Clone - 主要JavaScript文件

class ScratchClone {
    constructor() {
        this.workspace = document.getElementById('workspace');
        this.sprite = document.getElementById('sprite');
        this.runtimeLog = document.getElementById('runtime-log');
        this.blockConnection = new BlockConnection();
        this.blockConnection.setScratchClone(this);
        this.isDragging = false;
        this.draggedElement = null;
        this.dragRAF = null; // 用于拖拽动画帧
        this.offset = { x: 0, y: 0 };
        this.blocks = [];
        this.isRunning = false;
        this.spritePosition = { x: 50, y: 50 };
        this.spriteRotation = 0;
        this.spriteSize = 100; // 百分比
        this.isVisible = true;
        
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupControls();
        this.setupDeleteFunctionality();
        this.setupRuntimeLogging();
        this.updateSpritePosition();
    }

    // 设置拖拽功能
    setupDragAndDrop() {
        // 延迟设置事件监听器，确保DOM完全加载
        setTimeout(() => {
            // 为所有块添加拖拽事件
            const blocks = document.querySelectorAll('.block');
            
            blocks.forEach((block, index) => {
                // 使用捕获阶段来确保事件能被处理
                block.addEventListener('mousedown', (e) => {
                    e.stopPropagation();
                    this.startDrag(e, block);
                }, true);
                
                // 添加样式确保可点击
                block.style.pointerEvents = 'auto';
                block.style.cursor = 'grab';
                
                // 为输入框和选择框添加事件处理
                this.setupBlockInputs(block);
            });
        }, 100);

        // 为工作区添加放置事件
        this.workspace.addEventListener('dragover', (e) => e.preventDefault());
        this.workspace.addEventListener('drop', (e) => this.handleDrop(e));
        
        // 全局鼠标事件
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());
    }

    startDrag(e, element) {
        e.preventDefault(); // 阻止默认拖拽行为
        
        if (element.closest('.workspace-area')) {
            // 如果块已经在工作区，移动它
            this.isDragging = true;
            this.draggedElement = element;
            const rect = element.getBoundingClientRect();
            const workspaceRect = this.workspace.getBoundingClientRect();
            
            // 计算相对于工作区的位置
            const currentX = rect.left - workspaceRect.left;
            const currentY = rect.top - workspaceRect.top;
            
            this.offset.x = e.clientX - rect.left;
            this.offset.y = e.clientY - rect.top;
            
            // 切换到 transform 定位
            element.style.position = 'absolute';
            element.style.left = '0px';
            element.style.top = '0px';
            element.style.transform = `translate(${currentX}px, ${currentY}px)`;
            element.style.transition = 'none'; // 拖拽时禁用过渡效果
            element.style.zIndex = '1000';
            element.classList.add('dragging');
        } else {
            // 从调色板创建新块
            this.createNewBlock(e, element);
        }
    }

    createNewBlock(e, templateElement) {
        const newBlock = templateElement.cloneNode(true);
        newBlock.classList.add('workspace-block');
        
        // 获取工作区的位置
        const workspaceRect = this.workspace.getBoundingClientRect();
        const x = e.clientX - workspaceRect.left - 50; // 50px偏移让积木在鼠标附近
        const y = e.clientY - workspaceRect.top - 20;  // 20px偏移
        
        newBlock.style.position = 'absolute';
        newBlock.style.left = '0px';
        newBlock.style.top = '0px';
        newBlock.style.transform = `translate(${x}px, ${y}px)`;
        newBlock.style.zIndex = '1000';
        newBlock.style.transition = 'none'; // 拖拽时禁用过渡效果
        newBlock.classList.add('dragging');
        
        // 为新块添加唯一ID
        newBlock.id = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.workspace.appendChild(newBlock);
        
        this.isDragging = true;
        this.draggedElement = newBlock;
        // 设置正确的偏移量
        this.offset.x = 50;
        this.offset.y = 20;
        
        // 为新块添加事件监听器
        newBlock.addEventListener('mousedown', (e) => this.startDrag(e, newBlock));
        
        // 为新积木设置输入框事件
        this.setupBlockInputs(newBlock);
        
        this.logRuntime(`从调色板添加积木: ${this.getBlockDescription(newBlock.dataset.type)}`, 'info');
    }

    // 为积木设置输入框和选择框事件
    setupBlockInputs(block) {
        // 所有输入框类型
        const inputs = block.querySelectorAll('input, select');
        
        inputs.forEach(input => {
            input.addEventListener('click', (e) => e.stopPropagation());
            input.addEventListener('mousedown', (e) => e.stopPropagation());
            
            if (input.type === 'number' || input.type === 'text') {
                input.addEventListener('change', (e) => {
                    const inputClass = e.target.className;
                    let message = '';
                    
                    switch (inputClass) {
                        case 'repeat-input':
                            message = `重复次数已更改为: ${e.target.value}`;
                            break;
                        case 'wait-input':
                            message = `等待时间已更改为: ${e.target.value}秒`;
                            break;
                        case 'x-input':
                        case 'y-input':
                            message = `坐标已更改`;
                            break;
                        case 'duration-input':
                            message = `持续时间已更改为: ${e.target.value}秒`;
                            break;
                        case 'say-text':
                            message = `说话内容已更改为: "${e.target.value}"`;
                            break;
                        case 'say-duration':
                            message = `说话持续时间已更改为: ${e.target.value}秒`;
                            break;
                        case 'size-change':
                            message = `大小改变已设置为: ${e.target.value}%`;
                            break;
                        default:
                            message = `参数已更改`;
                    }
                    
                    this.logRuntime(message, 'info');
                });
            } else if (input.tagName === 'SELECT') {
                input.addEventListener('change', (e) => {
                    this.logRuntime(`条件已更改为: ${e.target.options[e.target.selectedIndex].text}`, 'info');
                });
            }
        });
    }

    drag(e) {
        if (!this.isDragging || !this.draggedElement) return;
        
        // 使用 requestAnimationFrame 来优化性能
        if (this.dragRAF) {
            cancelAnimationFrame(this.dragRAF);
        }
        
        this.dragRAF = requestAnimationFrame(() => {
            if (!this.isDragging || !this.draggedElement) return;
            
            const workspaceRect = this.workspace.getBoundingClientRect();
            const x = e.clientX - workspaceRect.left - this.offset.x;
            const y = e.clientY - workspaceRect.top - this.offset.y;
            
            // 使用 transform 代替 left/top 来获得更好的性能
            this.draggedElement.style.transform = `translate(${x}px, ${y}px)`;
            
            // 检查是否在删除区域并更新视觉反馈
            this.updateDeleteZoneVisual(e);
        });
    }

    // 更新删除区域的视觉反馈
    updateDeleteZoneVisual(e) {
        // 只对工作区的积木显示删除区域反馈
        if (!this.draggedElement.classList.contains('workspace-block')) {
            return;
        }

        const blockCategories = document.querySelector('.block-categories');
        const categoriesRect = blockCategories.getBoundingClientRect();
        
        // 检查鼠标是否在积木类别区域
        const isInDeleteZone = e.clientX >= categoriesRect.left - 20 &&
                              e.clientX <= categoriesRect.right + 20 &&
                              e.clientY >= categoriesRect.top - 20 &&
                              e.clientY <= categoriesRect.bottom + 20;
        
        if (isInDeleteZone && !blockCategories.classList.contains('delete-zone-active')) {
            blockCategories.classList.add('delete-zone-active');
            this.showDeleteHint();
        } else if (!isInDeleteZone && blockCategories.classList.contains('delete-zone-active')) {
            blockCategories.classList.remove('delete-zone-active');
            this.hideDeleteHint();
        }
    }

    // 显示删除提示
    showDeleteHint() {
        let hint = document.querySelector('.delete-hint');
        if (!hint) {
            hint = document.createElement('div');
            hint.className = 'delete-hint';
            hint.innerHTML = '🗑️ 松开鼠标删除积木';
            document.body.appendChild(hint);
        }
        hint.style.display = 'block';
    }

    // 隐藏删除提示
    hideDeleteHint() {
        const hint = document.querySelector('.delete-hint');
        if (hint) {
            hint.style.display = 'none';
        }
    }

    endDrag() {
        if (this.isDragging && this.draggedElement) {
            // 清理动画帧
            if (this.dragRAF) {
                cancelAnimationFrame(this.dragRAF);
                this.dragRAF = null;
            }
            
            // 获取当前 transform 位置并转换为 left/top
            const transform = this.draggedElement.style.transform;
            const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/);
            if (match) {
                const x = parseFloat(match[1]);
                const y = parseFloat(match[2]);
                
                this.draggedElement.style.left = x + 'px';
                this.draggedElement.style.top = y + 'px';
                this.draggedElement.style.transform = 'none';
            }
            
            // 恢复过渡效果
            this.draggedElement.style.transition = '';
            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.zIndex = 'auto';
            
            // 检查是否拖回积木区域删除
            if (this.checkDragBackToDelete(this.draggedElement)) {
                return; // 如果是删除操作，直接返回
            }
            
            // 检查是否可以连接其他积木或放置到容器中
            if (!this.checkAndPlaceInContainer(this.draggedElement)) {
                this.checkAndConnectBlocks(this.draggedElement);
            }
            
            // 记录拖拽完成
            if (this.draggedElement.closest('.workspace-area')) {
                this.logRuntime(`拖拽完成: ${this.getBlockDescription(this.draggedElement.dataset.type)}`, 'info');
            }
        }
        
        // 清理删除区域视觉效果
        const blockCategories = document.querySelector('.block-categories');
        if (blockCategories) {
            blockCategories.classList.remove('delete-zone-active');
        }
        this.hideDeleteHint();
        
        this.isDragging = false;
        this.draggedElement = null;
    }

    // 检查是否拖回积木区域进行删除
    checkDragBackToDelete(block) {
        // 只有从工作区拖出的积木才能删除
        if (!block.classList.contains('workspace-block')) {
            return false;
        }

        const blockRect = block.getBoundingClientRect();
        const blockCategories = document.querySelector('.block-categories');
        const categoriesRect = blockCategories.getBoundingClientRect();
        
        // 检查积木是否在积木类别区域内
        if (blockRect.left >= categoriesRect.left - 20 &&
            blockRect.right <= categoriesRect.right + 20 &&
            blockRect.top >= categoriesRect.top - 20 &&
            blockRect.bottom <= categoriesRect.bottom + 20) {
            
            this.showDeleteConfirmation(block);
            return true;
        }
        return false;
    }

    // 显示删除确认对话框
    showDeleteConfirmation(block) {
        const blockType = this.getBlockDescription(block.dataset.type);
        const confirmed = confirm(`确定要删除这个${blockType}吗？\n\n提示：您也可以右键点击积木或使用Delete键删除。`);
        
        if (confirmed) {
            this.logRuntime(`通过拖回积木区删除: ${blockType}`, 'warning');
            
            // 如果积木在容器内，需要恢复容器的占位符
            const container = block.closest('.block-container');
            if (container) {
                const remainingBlocks = container.querySelectorAll('.workspace-block');
                if (remainingBlocks.length === 1) { // 只剩这一个积木
                    container.classList.remove('has-blocks');
                    const placeholder = container.querySelector('.container-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'block';
                    }
                }
            }
            
            // 断开连接
            this.blockConnection.disconnect(block);
            
            // 执行删除动画
            this.performDeleteAnimation(block);
        } else {
            // 用户取消删除，恢复积木位置
            this.logRuntime(`取消删除积木: ${blockType}`, 'info');
            
            // 将积木移回工作区中央
            block.style.left = '200px';
            block.style.top = '100px';
            block.style.transform = 'none';
        }
    }

    // 执行删除动画
    performDeleteAnimation(block) {
        block.style.transition = 'all 0.4s ease';
        block.style.transform = 'scale(0) rotate(360deg)';
        block.style.opacity = '0';
        
        setTimeout(() => {
            if (block.parentNode) {
                block.parentNode.removeChild(block);
            }
        }, 400);
    }

    // 检查是否可以放置到容器中
    checkAndPlaceInContainer(block) {
        // 容器类型的积木不能放到容器内
        if (block.classList.contains('container-block')) {
            return false;
        }

        const blockRect = block.getBoundingClientRect();
        const containers = this.workspace.querySelectorAll('.block-container');
        
        for (const container of containers) {
            const containerRect = container.getBoundingClientRect();
            
            // 检查积木是否在容器区域内
            if (blockRect.left >= containerRect.left - 10 &&
                blockRect.right <= containerRect.right + 10 &&
                blockRect.top >= containerRect.top - 10 &&
                blockRect.bottom <= containerRect.bottom + 10) {
                
                this.placeBlockInContainer(block, container);
                return true;
            }
        }
        return false;
    }
    
    // 将积木放置到容器中
    placeBlockInContainer(block, container) {
        // 移除占位符
        const placeholder = container.querySelector('.container-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // 重置积木样式为容器内样式
        block.style.position = 'relative';
        block.style.left = 'auto';
        block.style.top = 'auto';
        block.style.transform = 'none';
        block.style.width = '100%';
        block.style.margin = '2px 0';
        
        // 将积木添加到容器中
        container.appendChild(block);
        container.classList.add('has-blocks');
        
        this.logRuntime(`积木已放置到容器中: ${this.getBlockDescription(block.dataset.type)}`, 'info');
    }
    
    // 检查并连接积木
    checkAndConnectBlocks(block) {
        const workspaceBlocks = this.workspace.querySelectorAll('.workspace-block');
        
        for (const otherBlock of workspaceBlocks) {
            if (otherBlock === block) continue;
            
            if (this.blockConnection.canConnect(otherBlock, block)) {
                this.blockConnection.connect(otherBlock, block);
                break;
            }
        }
    }

    // 添加更多积木类型和描述
    getBlockDescription(blockType) {
        const descriptions = {
            'move': '移动积木',
            'turn-right': '右转积木',
            'turn-left': '左转积木',
            'say': '说话积木',
            'show': '显示积木',
            'hide': '隐藏积木',
            'wait': '等待积木',
            'repeat': '重复执行积木',
            'forever': '无限循环积木',
            'when-clicked': '点击事件积木',
            'when-green-flag': '绿旗事件积木',
            'move-to': '移动到指定位置积木',
            'glide': '滑行积木',
            'say-custom': '自定义说话积木',
            'change-size': '改变大小积木',
            'if': '条件判断积木'
        };
        return descriptions[blockType] || '未知积木';
    }

    handleDrop(e) {
        e.preventDefault();
        // 处理块放置逻辑
    }

    // 设置控制按钮
    setupControls() {
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());
        document.getElementById('stop-btn').addEventListener('click', () => this.stopCode());
        document.getElementById('green-flag').addEventListener('click', () => this.runCode());
    }

    // 设置删除功能
    setupDeleteFunctionality() {
        // 右键删除功能
        this.workspace.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const block = e.target.closest('.workspace-block');
            if (block) {
                this.showDeleteMenu(e, block);
            }
        });

        // 键盘删除功能
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                const selectedBlock = document.querySelector('.workspace-block.selected');
                if (selectedBlock) {
                    this.deleteBlock(selectedBlock);
                }
            }
        });

        // 点击选中块
        this.workspace.addEventListener('click', (e) => {
            if (e.target.closest('.workspace-block')) {
                this.selectBlock(e.target.closest('.workspace-block'));
            } else {
                this.clearSelection();
            }
        });
    }

    // 显示删除菜单
    showDeleteMenu(e, block) {
        // 移除已存在的菜单
        const existingMenu = document.querySelector('.delete-menu');
        if (existingMenu) {
            existingMenu.remove();
        }

        // 创建删除菜单
        const menu = document.createElement('div');
        menu.className = 'delete-menu';
        menu.innerHTML = `
            <div class="delete-menu-item" onclick="scratchClone.deleteBlock('${block.id}')">
                🗑️ 删除积木
            </div>
        `;
        
        menu.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 2000;
            left: ${e.pageX}px;
            top: ${e.pageY}px;
            padding: 5px 0;
            min-width: 120px;
        `;

        document.body.appendChild(menu);

        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', function closeMenu() {
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            });
        }, 100);
    }

    // 选中块
    selectBlock(block) {
        this.clearSelection();
        block.classList.add('selected');
        block.style.outline = '2px solid #2196F3';
        block.style.outlineOffset = '2px';
        this.logRuntime(`选中积木: ${this.getBlockDescription(block.dataset.type)}`, 'info');
    }

    // 清除选中状态
    clearSelection() {
        document.querySelectorAll('.workspace-block.selected').forEach(block => {
            block.classList.remove('selected');
            block.style.outline = 'none';
        });
    }

    // 删除块
    deleteBlock(block) {
        if (typeof block === 'string') {
            block = document.getElementById(block);
        }
        
        if (block && block.parentNode) {
            // 添加删除动画
            block.style.transition = 'all 0.3s ease';
            block.style.transform = 'scale(0) rotate(180deg)';
            block.style.opacity = '0';
            
            setTimeout(() => {
                if (block.parentNode) {
                    block.parentNode.removeChild(block);
                }
            }, 300);
        }
        
        // 关闭删除菜单
        const menu = document.querySelector('.delete-menu');
        if (menu) {
            menu.remove();
        }
    }

    // 设置运行日志功能
    setupRuntimeLogging() {
        // 清空日志按钮
        document.getElementById('clear-log').addEventListener('click', () => {
            this.clearRuntimeLog();
        });

        // 初始日志
        this.logRuntime('Scratch Clone 已启动', 'info');
    }

    // 添加运行日志
    logRuntime(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `<span style="color: #999; font-size: 10px;">[${timestamp}]</span> ${message}`;
        
        this.runtimeLog.appendChild(logEntry);
        
        // 自动滚动到底部
        this.runtimeLog.scrollTop = this.runtimeLog.scrollHeight;
        
        // 限制日志条目数量，保持最新的50条
        const entries = this.runtimeLog.querySelectorAll('.log-entry');
        if (entries.length > 50) {
            entries[0].remove();
        }
    }

    // 清空运行日志
    clearRuntimeLog() {
        this.runtimeLog.innerHTML = '';
        this.logRuntime('日志已清空', 'info');
    }

    // 运行代码
    async runCode() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.logRuntime('开始运行代码...', 'execution');
        console.log('开始运行代码...');
        
        const workspaceBlocks = this.workspace.querySelectorAll('.workspace-block');
        
        if (workspaceBlocks.length === 0) {
            this.logRuntime('工作区中没有积木', 'warning');
        } else {
            this.logRuntime(`找到 ${workspaceBlocks.length} 个积木，开始执行`, 'info');
        }
        
        for (let i = 0; i < workspaceBlocks.length; i++) {
            if (!this.isRunning) {
                this.logRuntime('代码运行被中断', 'warning');
                break;
            }
            
            const block = workspaceBlocks[i];
            
            // 如果这个块已经被连接，跳过它（它会在连接链中被执行）
            let isConnected = false;
            for (const [key, value] of this.blockConnection.connections) {
                if (value === block) {
                    isConnected = true;
                    break;
                }
            }
            
            if (!isConnected) {
                // 检查是否有连接链
                const chain = this.blockConnection.getConnectionChain(block);
                if (chain.length > 1) {
                    await this.executeConnectionChain(block);
                } else {
                    const blockType = block.dataset.type;
                    this.logRuntime(`执行积木 ${i + 1}: ${this.getBlockDescription(blockType)}`, 'execution');
                    await this.executeBlock(block);
                }
            }
        }
        
        this.isRunning = false;
        if (this.isRunning === false) {
            this.logRuntime('代码运行完成', 'success');
        }
        console.log('代码运行完成');
    }

    // 停止代码
    stopCode() {
        this.isRunning = false;
        this.logRuntime('代码运行已停止', 'warning');
        console.log('停止运行');
    }

    // 执行连接链
    async executeConnectionChain(startBlock) {
        const chain = this.blockConnection.getConnectionChain(startBlock);
        
        if (chain.length > 1) {
            this.logRuntime(`执行连接链，共 ${chain.length} 个积木`, 'execution');
        }
        
        for (let i = 0; i < chain.length; i++) {
            if (!this.isRunning) {
                this.logRuntime('连接链执行被中断', 'warning');
                break;
            }
            
            const block = chain[i];
            const blockType = block.dataset.type;
            this.logRuntime(`执行连接链 ${i + 1}/${chain.length}: ${this.getBlockDescription(blockType)}`, 'execution');
            
            await this.executeBlock(block);
        }
    }

    // 执行单个块
    async executeBlock(block) {
        const blockType = block.dataset.type;
        
        switch (blockType) {
            case 'move':
                await this.moveSprite(10);
                break;
            case 'turn-right':
                this.turnSprite(15);
                break;
            case 'turn-left':
                this.turnSprite(-15);
                break;
            case 'say':
                this.saySomething('Hello', 2000);
                break;
            case 'show':
                this.showSprite();
                break;
            case 'hide':
                this.hideSprite();
                break;
            case 'wait':
                const waitInput = block.querySelector('.wait-input');
                const waitTime = waitInput ? parseFloat(waitInput.value) * 1000 : 1000;
                await this.wait(waitTime);
                break;
            case 'repeat':
                await this.repeatBlock(block, 10);
                break;
            case 'forever':
                await this.foreverBlock(block);
                break;
            case 'if':
                await this.ifBlock(block);
                break;
            case 'move-to':
                await this.moveToPosition(block);
                break;
            case 'glide':
                await this.glideToRandom(block);
                break;
            case 'say-custom':
                await this.sayCustom(block);
                break;
            case 'change-size':
                this.changeSize(block);
                break;
            default:
                this.logRuntime(`未知块类型: ${blockType}`, 'error');
        }
    }

    // 运动相关方法
    async moveSprite(steps) {
        const radians = (this.spriteRotation * Math.PI) / 180;
        const oldX = this.spritePosition.x;
        const oldY = this.spritePosition.y;
        
        this.spritePosition.x += Math.cos(radians) * steps;
        this.spritePosition.y += Math.sin(radians) * steps;
        
        // 边界检查
        this.spritePosition.x = Math.max(0, Math.min(100, this.spritePosition.x));
        this.spritePosition.y = Math.max(0, Math.min(100, this.spritePosition.y));
        
        this.updateSpritePosition();
        
        this.logRuntime(`角色移动: ${steps}步 (位置: ${Math.round(oldX)},${Math.round(oldY)} -> ${Math.round(this.spritePosition.x)},${Math.round(this.spritePosition.y)})`, 'execution');
        
        // 添加移动动画效果
        this.sprite.style.transition = 'all 0.3s ease';
        await this.wait(300);
        this.sprite.style.transition = 'all 0.1s ease';
    }

    turnSprite(degrees) {
        const oldRotation = this.spriteRotation;
        this.spriteRotation += degrees;
        this.updateSpriteRotation();
        this.logRuntime(`角色旋转: ${degrees}度 (角度: ${oldRotation}° → ${this.spriteRotation}°)`, 'execution');
    }

    updateSpritePosition() {
        this.sprite.style.left = this.spritePosition.x + '%';
        this.sprite.style.top = this.spritePosition.y + '%';
    }

    updateSpriteRotation() {
        this.sprite.style.transform = `translate(-50%, -50%) rotate(${this.spriteRotation}deg)`;
    }

    // 外观相关方法
    saySomething(message, duration) {
        // 移除现有的对话气泡
        const existingBubble = this.sprite.querySelector('.speech-bubble');
        if (existingBubble) {
            existingBubble.remove();
        }
        
        const bubble = document.createElement('div');
        bubble.className = 'speech-bubble';
        bubble.textContent = message;
        bubble.style.cssText = `
            position: absolute;
            background: white;
            border: 2px solid #333;
            border-radius: 15px;
            padding: 8px 12px;
            font-size: 12px;
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            max-width: 120px;
            text-align: center;
            word-wrap: break-word;
            animation: bubbleAppear 0.3s ease;
        `;
        
        // 添加气泡尾巴
        const tail = document.createElement('div');
        tail.style.cssText = `
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid #333;
        `;
        
        bubble.appendChild(tail);
        this.sprite.appendChild(bubble);
        this.logRuntime(`角色说: "${message}" (${duration/1000}秒)`, 'execution');
        
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.style.animation = 'bubbleDisappear 0.3s ease';
                setTimeout(() => {
                    if (bubble.parentNode) {
                        bubble.parentNode.removeChild(bubble);
                    }
                }, 300);
            }
        }, duration);
    }

    showSprite() {
        this.isVisible = true;
        this.sprite.style.display = 'block';
        this.logRuntime('角色已显示', 'execution');
    }

    hideSprite() {
        this.isVisible = false;
        this.sprite.style.display = 'none';
        this.logRuntime('角色已隐藏', 'execution');
    }

    // 控制相关方法
    wait(ms) {
        this.logRuntime(`等待 ${ms/1000} 秒`, 'execution');
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async repeatBlock(block, times) {
        // 获取重复次数（从输入框或默认值）
        const input = block.querySelector('.repeat-input');
        const repeatTimes = input ? parseInt(input.value) : times || 10;
        
        this.logRuntime(`开始重复执行 ${repeatTimes} 次`, 'execution');
        
        // 获取容器内的积木
        const container = block.querySelector('.block-container');
        const innerBlocks = container ? container.querySelectorAll('.workspace-block') : [];
        
        if (innerBlocks.length === 0) {
            this.logRuntime('重复执行积木内为空', 'warning');
            return;
        }
        
        for (let i = 0; i < repeatTimes; i++) {
            if (!this.isRunning) break;
            this.logRuntime(`重复执行第 ${i + 1}/${repeatTimes} 次`, 'execution');
            
            // 执行容器内的所有积木
            for (const innerBlock of innerBlocks) {
                if (!this.isRunning) break;
                await this.executeBlock(innerBlock);
            }
        }
        this.logRuntime(`重复执行完成`, 'success');
    }

    async foreverBlock(block) {
        this.logRuntime('开始无限循环执行', 'execution');
        
        // 获取容器内的积木
        const container = block.querySelector('.block-container');
        const innerBlocks = container ? container.querySelectorAll('.workspace-block') : [];
        
        if (innerBlocks.length === 0) {
            this.logRuntime('无限循环积木内为空', 'warning');
            return;
        }
        
        let count = 0;
        while (this.isRunning) {
            count++;
            if (count % 5 === 1) { // 减少日志频率
                this.logRuntime(`无限循环执行中... (第${count}轮)`, 'execution');
            }
            
            // 执行容器内的所有积木
            for (const innerBlock of innerBlocks) {
                if (!this.isRunning) break;
                await this.executeBlock(innerBlock);
            }
            
            // 短暂延迟避免浏览器卡死
            await this.wait(50);
        }
        this.logRuntime(`无限循环已停止 (共执行${count}轮)`, 'warning');
    }

    // 条件判断积木
    async ifBlock(block) {
        const select = block.querySelector('.condition-select');
        const condition = select ? select.value : 'always';
        
        let conditionMet = false;
        
        switch (condition) {
            case 'mouse-clicked':
                // 简化实现：随机判断
                conditionMet = Math.random() > 0.7;
                break;
            case 'key-pressed':
                conditionMet = Math.random() > 0.8;
                break;
            case 'sprite-edge':
                // 检查角色是否接近边缘
                conditionMet = this.spritePosition.x <= 5 || this.spritePosition.x >= 95 || 
                              this.spritePosition.y <= 5 || this.spritePosition.y >= 95;
                break;
            case 'always':
                conditionMet = true;
                break;
        }
        
        this.logRuntime(`条件判断: ${select.options[select.selectedIndex].text} - ${conditionMet ? '成立' : '不成立'}`, 'execution');
        
        if (conditionMet) {
            // 获取容器内的积木并执行
            const container = block.querySelector('.block-container');
            const innerBlocks = container ? container.querySelectorAll('.workspace-block') : [];
            
            for (const innerBlock of innerBlocks) {
                if (!this.isRunning) break;
                await this.executeBlock(innerBlock);
            }
        }
    }

    // 移动到指定位置
    async moveToPosition(block) {
        const xInput = block.querySelector('.x-input');
        const yInput = block.querySelector('.y-input');
        
        const targetX = xInput ? parseFloat(xInput.value) : 0;
        const targetY = yInput ? parseFloat(yInput.value) : 0;
        
        // 转换坐标范围 (-100 to 100) -> (0 to 100)
        const newX = Math.max(0, Math.min(100, (targetX + 100) / 2));
        const newY = Math.max(0, Math.min(100, (targetY + 100) / 2));
        
        this.spritePosition.x = newX;
        this.spritePosition.y = newY;
        
        this.updateSpritePosition();
        this.logRuntime(`角色移动到: (${targetX}, ${targetY})`, 'execution');
        
        // 添加移动动画
        this.sprite.style.transition = 'all 0.5s ease';
        await this.wait(500);
        this.sprite.style.transition = 'all 0.1s ease';
    }

    // 滑行到随机位置
    async glideToRandom(block) {
        const durationInput = block.querySelector('.duration-input');
        const duration = durationInput ? parseFloat(durationInput.value) * 1000 : 2000;
        
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        
        this.spritePosition.x = randomX;
        this.spritePosition.y = randomY;
        
        this.logRuntime(`滑行到随机位置: (${Math.round(randomX)}, ${Math.round(randomY)}) 用时${duration/1000}秒`, 'execution');
        
        this.sprite.style.transition = `all ${duration/1000}s ease`;
        this.updateSpritePosition();
        await this.wait(duration);
        this.sprite.style.transition = 'all 0.1s ease';
    }

    // 自定义说话
    async sayCustom(block) {
        const textInput = block.querySelector('.say-text');
        const durationInput = block.querySelector('.say-duration');
        
        const message = textInput ? textInput.value : '你好！';
        const duration = durationInput ? parseFloat(durationInput.value) * 1000 : 2000;
        
        this.saySomething(message, duration);
        this.logRuntime(`角色说: "${message}" (${duration/1000}秒)`, 'execution');
        await this.wait(duration);
    }

    // 改变大小
    changeSize(block) {
        const changeInput = block.querySelector('.size-change');
        const change = changeInput ? parseFloat(changeInput.value) : 10;
        
        this.spriteSize += change;
        this.spriteSize = Math.max(10, Math.min(300, this.spriteSize)); // 限制在10%-300%之间
        
        this.sprite.style.fontSize = (48 * this.spriteSize / 100) + 'px';
        this.logRuntime(`角色大小改变: ${change > 0 ? '+' : ''}${change}% (当前: ${this.spriteSize}%)`, 'execution');
    }

    // 获取积木描述
    getBlockDescription(blockType) {
        const descriptions = {
            'move': '移动积木',
            'turn-right': '右转积木',
            'turn-left': '左转积木',
            'say': '说话积木',
            'show': '显示积木',
            'hide': '隐藏积木',
            'wait': '等待积木',
            'repeat': '重复执行积木',
            'forever': '无限循环积木',
            'when-clicked': '点击事件积木',
            'when-green-flag': '绿旗事件积木'
        };
        return descriptions[blockType] || '未知积木';
    }



    // 删除块
    deleteBlock(block) {
        if (typeof block === 'string') {
            block = document.getElementById(block);
        }
        
        if (block && block.parentNode) {
            const blockType = block.dataset.type;
            this.logRuntime(`删除积木: ${this.getBlockDescription(blockType)}`, 'warning');
            
            // 断开相关连接
            this.blockConnection.disconnect(block);
            
            // 添加删除动画
            block.style.transition = 'all 0.3s ease';
            block.style.transform = 'scale(0) rotate(180deg)';
            block.style.opacity = '0';
            
            setTimeout(() => {
                if (block.parentNode) {
                    block.parentNode.removeChild(block);
                }
            }, 300);
        }
        
        // 关闭删除菜单
        const menu = document.querySelector('.delete-menu');
        if (menu) {
            menu.remove();
        }
    }
}

// 初始化应用
let scratchClone;
document.addEventListener('DOMContentLoaded', () => {
    scratchClone = new ScratchClone();
});

// 扩展功能：块连接系统
class BlockConnection {
    constructor() {
        this.connections = new Map();
        this.scratchClone = null;
    }

    setScratchClone(instance) {
        this.scratchClone = instance;
    }

    // 检查两个块是否可以连接
    canConnect(block1, block2) {
        // 简化的连接逻辑
        const rect1 = block1.getBoundingClientRect();
        const rect2 = block2.getBoundingClientRect();
        
        const distance = Math.sqrt(
            Math.pow(rect1.bottom - rect2.top, 2) +
            Math.pow(rect1.left + rect1.width/2 - rect2.left - rect2.width/2, 2)
        );
        
        return distance < 20; // 如果距离小于20像素，可以连接
    }

    // 连接两个块
    connect(block1, block2) {
        this.connections.set(block1, block2);
        this.snapBlocks(block1, block2);
        
        // 添加连接样式
        block2.classList.add('connected');
        
        if (this.scratchClone) {
            this.scratchClone.logRuntime(`积木已连接: ${this.scratchClone.getBlockDescription(block1.dataset.type)} -> ${this.scratchClone.getBlockDescription(block2.dataset.type)}`, 'connection');
        }
    }

    // 断开连接
    disconnect(block) {
        const connectedBlock = this.connections.get(block);
        if (connectedBlock) {
            connectedBlock.classList.remove('connected');
            this.connections.delete(block);
            
            if (this.scratchClone) {
                this.scratchClone.logRuntime(`积木连接已断开`, 'warning');
            }
        }
    }

    // 吸附块
    snapBlocks(block1, block2) {
        const rect1 = block1.getBoundingClientRect();
        const workspace = document.getElementById('workspace');
        const workspaceRect = workspace.getBoundingClientRect();
        
        block2.style.position = 'absolute';
        block2.style.left = (rect1.left - workspaceRect.left) + 'px';
        block2.style.top = (rect1.bottom - workspaceRect.top + 5) + 'px';
    }

    // 获取连接链
    getConnectionChain(startBlock) {
        const chain = [];
        let current = startBlock;
        
        while (current) {
            chain.push(current);
            current = this.connections.get(current);
        }
        
        return chain;
    }
}

// 添加键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                document.getElementById('run-btn').click();
                break;
            case '.':
                e.preventDefault();
                document.getElementById('stop-btn').click();
                break;
        }
    }
});