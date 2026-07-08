// Image Upload Component
class ImageUploader {
  constructor(options = {}) {
    this.containerId = options.containerId || 'imageUploader';
    this.maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB
    this.maxFiles = options.maxFiles || 10;
    this.allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/webp'];
    this.category = options.category || 'destinations';
    this.multiple = options.multiple || false;
    this.onUpload = options.onUpload || function() {};
    this.onMultiUpload = options.onMultiUpload || function() {};
    this.currentImageUrl = options.currentImageUrl || null;
    this.currentImageUrls = options.currentImageUrls || [];
    this.uploadedImages = [];
    
    this.init();
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Container not found:', this.containerId);
      return;
    }

    const inputAttrs = this.multiple ? 'multiple' : '';
    const maxSizeMB = this.maxSize / 1024 / 1024;
    const hintText = this.multiple ? 
      `Hỗ trợ: JPG, PNG, WEBP (Tối đa ${maxSizeMB}MB mỗi file, tối đa ${this.maxFiles} file)` :
      `Hỗ trợ: JPG, PNG, WEBP (Tối đa ${maxSizeMB}MB)`;

    // Determine initial display: for multi-mode, show drop zone always (existing images shown in grid)
    const hasExisting = this.multiple ? (this.currentImageUrls && this.currentImageUrls.length > 0) : !!this.currentImageUrl;
    
    container.innerHTML = `
      <div class="image-uploader">
        <div class="image-preview-area" id="${this.containerId}Preview">
          ${(!this.multiple && this.currentImageUrl) ? 
            `<img src="${this.currentImageUrl}" alt="Preview" class="preview-image">
             <button type="button" class="remove-image-btn" onclick="window.imageUploaders['${this.containerId}'].removeImage()">✕</button>` :
            `<div class="upload-placeholder" id="${this.containerId}DropZone">
               <div class="upload-icon">📷</div>
               <div class="upload-text">${this.multiple ? 'Kéo thả ảnh vào đây hoặc click để chọn nhiều ảnh' : 'Kéo thả ảnh vào đây hoặc click để chọn'}</div>
               <div class="upload-hint">${hintText}</div>
               <input type="file" id="${this.containerId}Input" accept="image/jpeg,image/png,image/webp" ${inputAttrs} style="display:none">
             </div>`
          }
        </div>
        ${this.multiple ? `<div class="multi-preview-grid" id="${this.containerId}Grid" style="${(this.currentImageUrls && this.currentImageUrls.length > 0) ? 'display:grid;' : 'display:none;'};"></div>` : ''}
        <div class="upload-progress" id="${this.containerId}Progress" style="display:none">
          <div class="progress-bar">
            <div class="progress-fill" id="${this.containerId}ProgressFill"></div>
          </div>
          <div class="progress-text" id="${this.containerId}ProgressText">Đang tải lên...</div>
        </div>
        <div class="upload-error" id="${this.containerId}Error" style="display:none"></div>
      </div>
    `;

    // Render existing images in grid for multi-mode
    if (this.multiple && this.currentImageUrls && this.currentImageUrls.length > 0) {
      this.renderExistingImages();
    }

    this.addStyles();
    this.bindEvents();
  }

  renderExistingImages() {
    const grid = document.getElementById(`${this.containerId}Grid`);
    if (!grid) return;

    grid.innerHTML = '';
    this.currentImageUrls.forEach((url, index) => {
      const item = document.createElement('div');
      item.className = 'multi-preview-item success';
      item.id = `${this.containerId}Existing${index}`;
      item.innerHTML = `
        <img src="${url}" alt="Ảnh ${index + 1}">
        <button type="button" class="remove-btn" onclick="window.imageUploaders['${this.containerId}'].removeExistingImage(${index})">✕</button>
      `;
      grid.appendChild(item);
    });
  }

  removeExistingImage(index) {
    this.currentImageUrls.splice(index, 1);
    this.renderExistingImages();
    if (this.currentImageUrls.length === 0) {
      const grid = document.getElementById(`${this.containerId}Grid`);
      if (grid) grid.style.display = 'none';
    }
    this.onMultiUpload(this.currentImageUrls.map(url => ({ url })));
  }

  addStyles() {
    if (document.getElementById('imageUploaderStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'imageUploaderStyles';
    style.textContent = `
      .image-uploader {
        width: 100%;
      }
      .image-preview-area {
        width: 100%;
        min-height: 200px;
        border: 2px dashed var(--border, #e0ded8);
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        transition: all 0.3s ease;
      }
      .image-preview-area:hover {
        border-color: var(--accent, #2d6a4f);
      }
      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        padding: 40px 20px;
        cursor: pointer;
        transition: background 0.3s ease;
      }
      .upload-placeholder:hover {
        background: rgba(45, 106, 79, 0.05);
      }
      .upload-placeholder.dragover {
        background: rgba(45, 106, 79, 0.1);
        border-color: var(--accent, #2d6a4f);
      }
      .upload-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      .upload-text {
        font-size: 16px;
        font-weight: 600;
        color: var(--fg, #1a2e1a);
        margin-bottom: 8px;
      }
      .upload-hint {
        font-size: 13px;
        color: var(--muted, #6b7b6b);
      }
      .preview-image {
        width: 100%;
        height: 250px;
        object-fit: cover;
        display: block;
      }
      .remove-image-btn {
        position: absolute;
        top: 12px;
        right: 12px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(220, 38, 38, 0.9);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        z-index: 10;
      }
      .remove-image-btn:hover {
        background: rgba(220, 38, 38, 1);
        transform: scale(1.1);
      }
      .upload-progress {
        margin-top: 12px;
      }
      .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--border, #e0ded8);
        border-radius: 4px;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: var(--accent, #2d6a4f);
        border-radius: 4px;
        transition: width 0.3s ease;
        width: 0%;
      }
      .progress-text {
        font-size: 13px;
        color: var(--muted, #6b7b6b);
        margin-top: 8px;
        text-align: center;
      }
      .upload-error {
        margin-top: 12px;
        padding: 12px;
        background: rgba(220, 38, 38, 0.1);
        color: var(--danger, #dc2626);
        border-radius: 8px;
        font-size: 14px;
      }
      .multi-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
        margin-top: 12px;
      }
      .multi-preview-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid var(--border, #e0ded8);
      }
      .multi-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .multi-preview-item .remove-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(220, 38, 38, 0.9);
        color: white;
        border: none;
        cursor: pointer;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .multi-preview-item.uploading {
        opacity: 0.6;
      }
      .multi-preview-item.success {
        border-color: var(--accent, #2d6a4f);
      }
      .multi-preview-item.error {
        border-color: var(--danger, #dc2626);
      }
    `;
    document.head.appendChild(style);
  }

  bindEvents() {
    const dropZone = document.getElementById(`${this.containerId}DropZone`);
    const fileInput = document.getElementById(`${this.containerId}Input`);

    if (dropZone) {
      // Click to upload
      dropZone.addEventListener('click', () => fileInput.click());

      // Drag and drop
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          if (this.multiple) {
            this.handleMultipleFiles(files);
          } else {
            this.handleFile(files[0]);
          }
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          if (this.multiple) {
            this.handleMultipleFiles(e.target.files);
          } else {
            this.handleFile(e.target.files[0]);
          }
        }
      });
    }
  }

  handleFile(file) {
    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      this.showError('Định dạng file không hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP.');
      return;
    }

    // Validate file size
    if (file.size > this.maxSize) {
      this.showError(`File quá lớn. Kích thước tối đa là ${this.maxSize / 1024 / 1024}MB.`);
      return;
    }

    // Show preview
    this.showPreview(file);

    // Upload file
    this.uploadFile(file);
  }

  handleMultipleFiles(fileList) {
    const files = Array.from(fileList);
    
    // Validate number of files including existing
    const existingCount = this.currentImageUrls ? this.currentImageUrls.length : 0;
    const totalCount = existingCount + files.length;
    if (totalCount > this.maxFiles) {
      this.showError(`Tối đa ${this.maxFiles} ảnh. Hiện có ${existingCount} ảnh, bạn chọn thêm ${files.length} file.`);
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of files) {
      if (!this.allowedTypes.includes(file.type)) {
        this.showError(`File "${file.name}" không hỗ trợ. Chỉ chấp nhận JPG, PNG, WEBP.`);
        continue;
      }
      if (file.size > this.maxSize) {
        this.showError(`File "${file.name}" quá lớn. Kích thước tối đa là ${this.maxSize / 1024 / 1024}MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Show multi preview
    this.showMultiPreview(validFiles);

    // Upload files
    this.uploadMultipleFiles(validFiles);
  }

  showPreview(file) {
    const previewArea = document.getElementById(`${this.containerId}Preview`);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      previewArea.innerHTML = `
        <img src="${e.target.result}" alt="Preview" class="preview-image">
        <button type="button" class="remove-image-btn" onclick="window.imageUploaders['${this.containerId}'].removeImage()">✕</button>
      `;
    };
    
    reader.readAsDataURL(file);
  }

  showMultiPreview(files) {
    const grid = document.getElementById(`${this.containerId}Grid`);
    if (!grid) return;

    grid.style.display = 'grid';
    // Don't clear grid - append new previews after existing ones
    const existingCount = grid.children.length;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const item = document.createElement('div');
        item.className = 'multi-preview-item uploading';
        item.id = `${this.containerId}Item${existingCount + index}`;
        item.innerHTML = `
          <img src="${e.target.result}" alt="Preview ${existingCount + index + 1}">
          <div class="upload-status">⏳</div>
        `;
        grid.appendChild(item);
      };
      reader.readAsDataURL(file);
    });
  }

  async uploadFile(file) {
    const progress = document.getElementById(`${this.containerId}Progress`);
    const progressFill = document.getElementById(`${this.containerId}ProgressFill`);
    const progressText = document.getElementById(`${this.containerId}ProgressText`);
    
    progress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Đang tải lên...';

    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', this.category);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/image', true);
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        progressFill.style.width = percentComplete + '%';
        progressText.textContent = `Đang tải lên... ${Math.round(percentComplete)}%`;
      }
    };

    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && result.success) {
          progressFill.style.width = '100%';
          progressText.textContent = 'Tải lên thành công!';
          setTimeout(() => { progress.style.display = 'none'; }, 2000);
          this.currentImageUrl = result.data.url;
          this.onUpload(result.data);
        } else {
          throw new Error(result.message || `Lỗi máy chủ: ${xhr.status}`);
        }
      } catch (error) {
        progress.style.display = 'none';
        this.showError(error.message || 'Lỗi xử lý phản hồi từ máy chủ');
      }
    };

    xhr.onerror = () => {
      progress.style.display = 'none';
      this.showError('Lỗi kết nối mạng khi tải ảnh lên');
    };

    xhr.send(formData);
  }

  async uploadMultipleFiles(files) {
    const progress = document.getElementById(`${this.containerId}Progress`);
    const progressFill = document.getElementById(`${this.containerId}ProgressFill`);
    const progressText = document.getElementById(`${this.containerId}ProgressText`);
    
    progress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = `Đang tải lên 0/${files.length} ảnh...`;

    // Calculate offset for preview items (existing images + already uploaded)
    const previewOffset = this.currentImageUrls ? this.currentImageUrls.length : 0;

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('category', this.category);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/images', true);
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        progressFill.style.width = percentComplete + '%';
        progressText.textContent = `Đang tải lên... ${Math.round(percentComplete)}%`;
      }
    };

    xhr.onload = () => {
      try {
        const result = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && result.success) {
          progressFill.style.width = '100%';
          progressText.textContent = `Tải lên thành công ${result.data.length} ảnh!`;
          setTimeout(() => { progress.style.display = 'none'; }, 2000);
          
          // Update preview items
          result.data.forEach((img, index) => {
            const item = document.getElementById(`${this.containerId}Item${previewOffset + index}`);
            if (item) {
              item.classList.remove('uploading');
              item.classList.add('success');
              const status = item.querySelector('.upload-status');
              if (status) status.textContent = '✅';
            }
          });
          
          this.uploadedImages = result.data;
          // Append to currentImageUrls
          if (!this.currentImageUrls) this.currentImageUrls = [];
          result.data.forEach(d => {
            if (!this.currentImageUrls.includes(d.url)) {
              this.currentImageUrls.push(d.url);
            }
          });
          this.onMultiUpload(result.data);
        } else {
          throw new Error(result.message || `Lỗi máy chủ: ${xhr.status}`);
        }
      } catch (error) {
        progress.style.display = 'none';
        this.showError(error.message || 'Lỗi xử lý phản hồi từ máy chủ');
      }
    };

    xhr.onerror = () => {
      progress.style.display = 'none';
      this.showError('Lỗi kết nối mạng khi tải ảnh lên');
    };

    xhr.send(formData);
  }

  removeImage() {
    this.currentImageUrl = null;
    this.uploadedImages = [];
    this.currentImageUrls = [];
    const previewArea = document.getElementById(`${this.containerId}Preview`);
    const grid = document.getElementById(`${this.containerId}Grid`);
    
    const inputAttrs = this.multiple ? 'multiple' : '';
    const maxSizeMB = this.maxSize / 1024 / 1024;
    const hintText = this.multiple ? 
      `Hỗ trợ: JPG, PNG, WEBP (Tối đa ${maxSizeMB}MB mỗi file, tối đa ${this.maxFiles} file)` :
      `Hỗ trợ: JPG, PNG, WEBP (Tối đa ${maxSizeMB}MB)`;

    previewArea.innerHTML = `
      <div class="upload-placeholder" id="${this.containerId}DropZone">
        <div class="upload-icon">📷</div>
        <div class="upload-text">${this.multiple ? 'Kéo thả ảnh vào đây hoặc click để chọn nhiều ảnh' : 'Kéo thả ảnh vào đây hoặc click để chọn'}</div>
        <div class="upload-hint">${hintText}</div>
        <input type="file" id="${this.containerId}Input" accept="image/jpeg,image/png,image/webp" ${inputAttrs} style="display:none">
      </div>
    `;
    
    if (grid) {
      grid.style.display = 'none';
      grid.innerHTML = '';
    }
    
    this.bindEvents();
    this.onUpload(null);
    this.onMultiUpload([]);
  }

  showError(message) {
    const errorEl = document.getElementById(`${this.containerId}Error`);
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  }

  getImageUrl() {
    return this.currentImageUrl;
  }

  setImageUrl(url) {
    this.currentImageUrl = url;
    if (url) {
      const previewArea = document.getElementById(`${this.containerId}Preview`);
      previewArea.innerHTML = `
        <img src="${url}" alt="Preview" class="preview-image">
        <button type="button" class="remove-image-btn" onclick="window.imageUploaders['${this.containerId}'].removeImage()">✕</button>
      `;
    }
  }
}

// Global storage for image uploaders
window.imageUploaders = window.imageUploaders || {};
