  const fileInput = document.getElementById('upload-file');
        const dropZone = document.getElementById('drop-zone');
        const filterOptions = document.querySelectorAll('.filter-btn');
        const filterName = document.getElementById('filter-name');
        const filterValue = document.getElementById('filter-value');
        const filterSlider = document.getElementById('filter-slider');
        const activeFilterLabel = document.getElementById('active-filter-label');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const placeholder = document.getElementById('placeholder');
        const resetBtn = document.getElementById('reset-btn');
        const downloadBtn = document.getElementById('download-btn');
        const toast = document.getElementById('toast');

        let settings = {
            brightness: 100,
            saturation: 100,
            inversion: 0,
            grayscale: 0,
            contrast: 100,
            sepia: 0,
            rotate: 0,
            flipH: 1,
            flipV: 1
        };

        let activeFilter = "brightness";
        let originalImage = null;

        downloadBtn.disabled = true;

        const applyFilters = () => {
            if (!originalImage) return;

            const isRotatedSide = settings.rotate % 180 !== 0;
            
            if (isRotatedSide) {
                canvas.width = originalImage.height;
                canvas.height = originalImage.width;
            } else {
                canvas.width = originalImage.width;
                canvas.height = originalImage.height;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            ctx.translate(canvas.width / 2, canvas.height / 2);
            
            ctx.rotate(settings.rotate * Math.PI / 180);
            
            ctx.scale(settings.flipH, settings.flipV);

            ctx.filter = `
                brightness(${settings.brightness}%) 
                saturate(${settings.saturation}%) 
                invert(${settings.inversion}%) 
                grayscale(${settings.grayscale}%)
                contrast(${settings.contrast}%)
                sepia(${settings.sepia}%)
            `;

            ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2, originalImage.width, originalImage.height);

            ctx.restore();
        };

        const loadImage = (file) => {
            if(!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                originalImage = new Image();
                originalImage.src = reader.result;
                originalImage.onload = () => {
                    resetAllSettings();
                    placeholder.classList.add('hidden');
                    canvas.classList.remove('hidden');
                    downloadBtn.disabled = false;
                    applyFilters();
                }
            }
            reader.readAsDataURL(file);
        };

        const resetAllSettings = () => {
            settings = {
                brightness: 100,
                saturation: 100,
                inversion: 0,
                grayscale: 0,
                contrast: 100,
                sepia: 0,
                rotate: 0,
                flipH: 1,
                flipV: 1
            };
            
            setActiveFilter('brightness');
            applyFilters();
        };

        const updateFilterValue = () => {
            filterValue.innerText = `${filterSlider.value}%`;
            settings[activeFilter] = filterSlider.value;
            applyFilters();
        };

        const setActiveFilter = (filterKey) => {
            activeFilter = filterKey;
            
            filterOptions.forEach(btn => {
                if(btn.dataset.filter === filterKey) {
                    btn.classList.add('active', 'ring-2', 'ring-indigo-500', 'ring-offset-1', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
                    btn.classList.remove('bg-white', 'text-gray-600', 'border-gray-200');
                    filterName.innerText = btn.innerText.trim();
                    activeFilterLabel.innerText = btn.innerText.trim();
                } else {
                    btn.classList.remove('active', 'ring-2', 'ring-indigo-500', 'ring-offset-1', 'bg-indigo-50', 'text-indigo-700', 'border-indigo-200');
                    btn.classList.add('bg-white', 'text-gray-600', 'border-gray-200');
                }
            });

            const config = getFilterConfig(filterKey);
            filterSlider.max = config.max;
            filterSlider.value = settings[filterKey];
            filterValue.innerText = `${settings[filterKey]}%`;
        };

        const getFilterConfig = (key) => {
            switch(key) {
                case 'brightness': return { max: 200 };
                case 'saturation': return { max: 200 };
                case 'inversion': return { max: 100 };
                case 'grayscale': return { max: 100 };
                case 'contrast': return { max: 200 };
                case 'sepia': return { max: 100 };
                default: return { max: 100 };
            }
        };

        const showToast = () => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
            setTimeout(() => {
                toast.style.transform = 'translateY(20px)';
                toast.style.opacity = '0';
            }, 3000);
        };

        fileInput.addEventListener('change', () => loadImage(fileInput.files[0]));
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-indigo-500', 'bg-indigo-50/50');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/50');
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                loadImage(e.dataTransfer.files[0]);
            }
        });

        filterOptions.forEach(option => {
            option.addEventListener("click", (e) => setActiveFilter(e.currentTarget.dataset.filter));
        });

        filterSlider.addEventListener("input", updateFilterValue);

        document.getElementById('rotate-left').addEventListener('click', () => {
            settings.rotate -= 90;
            applyFilters();
        });

        document.getElementById('rotate-right').addEventListener('click', () => {
            settings.rotate += 90;
            applyFilters();
        });

        document.getElementById('flip-x').addEventListener('click', () => {
            settings.flipH = settings.flipH === 1 ? -1 : 1;
            applyFilters();
        });

        document.getElementById('flip-y').addEventListener('click', () => {
            settings.flipV = settings.flipV === 1 ? -1 : 1;
            applyFilters();
        });

        resetBtn.addEventListener('click', resetAllSettings);

        downloadBtn.addEventListener('click', () => {
            if(!originalImage) return;
            const link = document.createElement("a");
            link.download = "pixelperfect-edit.jpg";
            link.href = canvas.toDataURL("image/jpeg", 0.9);
            link.click();
            showToast();
        });