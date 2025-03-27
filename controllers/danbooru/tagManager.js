const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'tagCache.json');
const STATUS_FILE = path.join(__dirname, 'cacheStatus.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000 * 30; // 30 days

const CATEGORY_MAP = {
    0: "General",
    1: "Artist",
    3: "Copyright",
    4: "Character",
    5: "Meta"
};

class TagManager {
    constructor() {
        this.tags = new Map();
        this.lastUpdate = null;
        this.categorizedTags = {};
        this.isLoading = false;
        this.loadPromise = null;
    }

    async loadCacheStatus() {
        try {
            const data = await fs.readFile(STATUS_FILE, 'utf8');
            const status = JSON.parse(data);
            return status;
        } catch (error) {
            return {
                lastUpdate: null,
                totalTags: 0,
                lastUpdateTime: null
            };
        }
    }

    async saveCacheStatus() {
        try {
            const status = {
                lastUpdate: this.lastUpdate ? this.lastUpdate.toISOString() : null,
                totalTags: this.tags.size,
                lastUpdateTime: new Date().toISOString()
            };
            await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2));
            return true;
        } catch (error) {
            console.error('[ERROR] Lỗi khi lưu trạng thái cache:', error);
            return false;
        }
    }

    async loadCache() {
        if (this.isLoading) {
            return this.loadPromise;
        }

        this.isLoading = true;
        this.loadPromise = this._loadCache();
        
        try {
            const result = await this.loadPromise;
            return result;
        } finally {
            this.isLoading = false;
            this.loadPromise = null;
        }
    }

    async _loadCache() {
        try {
            // Đọc trạng thái cache trước
            const status = await this.loadCacheStatus();
            const lastUpdate = status.lastUpdate ? new Date(status.lastUpdate) : null;
            
            if (!lastUpdate) {
                console.log('[INFO] Chưa có cache, cần cập nhật');
                return false;
            }

            const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
            if (timeSinceLastUpdate >= CACHE_DURATION) {
                console.log('[INFO] Cache đã hết hạn, cần cập nhật');
                return false;
            }

            // Nếu cache còn hợp lệ, load dữ liệu
            const data = await fs.readFile(CACHE_FILE, 'utf8');
            const cache = JSON.parse(data);
            
            this.tags = new Map(Object.entries(cache.tags));
            this.categorizedTags = cache.categorizedTags;
            this.lastUpdate = lastUpdate;
            
            const hoursRemaining = Math.floor((CACHE_DURATION - timeSinceLastUpdate) / (60 * 60 * 1000));
            console.log(`[INFO] Cache còn hợp lệ (${status.totalTags} tags), còn ${hoursRemaining} giờ nữa mới cần cập nhật`);
            return true;
        } catch (error) {
            console.log('[WARNING] Không tìm thấy cache hoặc cache bị hỏng');
            return false;
        }
    }

    async saveCache() {
        try {
            const cache = {
                tags: Object.fromEntries(this.tags),
                categorizedTags: this.categorizedTags
            };
            await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
            await this.saveCacheStatus();
            console.log('[INFO] Đã lưu cache thành công');
            return true;
        } catch (error) {
            console.error('[ERROR] Lỗi khi lưu cache:', error);
            return false;
        }
    }

    async updateTags() {
        try {
            const cacheValid = await this.loadCache();
            if (cacheValid) {
                return true;
            }

            console.log('[INFO] Bắt đầu cập nhật tags...');
            this.tags.clear();
            this.categorizedTags = {};
            let page = 1;
            let allTags = [];

            while (true) {
                try {
                    console.log(`[INFO] Loading ${page}k data...`);
                    const url = `https://danbooru.donmai.us/tags.json?limit=1000&page=${page}&search[order]=count&search[hide_empty]=true`;
                    const response = await axios.get(url);
                    const tags = response.data;

                    if (!tags || tags.length === 0) {
                        console.log('[INFO] Không còn tag nào để tải');
                        break;
                    }

                    allTags.push(...tags);
                    page++;
                    
                    // Thêm delay để tránh rate limit
                    // await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    if (error.response && error.response.status === 410) {
                        console.log('[INFO] Đã đạt đến giới hạn trang');
                        break;
                    }
                    console.error(`[ERROR] Lỗi khi tải trang ${page}:`, error.message);
                    throw error;
                }
            }

            console.log(`[INFO] Đã tải tổng cộng ${allTags.length} tags, đang xử lý...`);
            
            const validTags = allTags.filter(tag => tag.post_count > 0);
            console.log(`[INFO] Có ${validTags.length} tags hợp lệ`);
            
            for (const tag of validTags) {
                const categoryName = CATEGORY_MAP[tag.category] || "Unknown";
                if (!this.categorizedTags[categoryName]) {
                    this.categorizedTags[categoryName] = [];
                }

                this.categorizedTags[categoryName].push({
                    name: tag.name,
                    category: CATEGORY_MAP[tag.category],
                    postCount: tag.post_count
                });

                this.tags.set(tag.name, {
                    name: tag.name,
                    category: tag.category,
                    post_count: tag.post_count
                });
            }

            this.lastUpdate = new Date();
            const saveResult = await this.saveCache();
            
            if (saveResult) {
                console.log(`[INFO] Đã cập nhật ${this.tags.size} tags thành công`);
                return true;
            } else {
                console.error('[ERROR] Không thể lưu cache');
                return false;
            }
        } catch (error) {
            console.error('[ERROR] Lỗi khi cập nhật tags:', error.message);
            if (error.response) {
                console.error('[ERROR] Chi tiết lỗi:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            return false;
        }
    }

    async getSuggestions(query) {
        try {
            await this.updateTags();

            const suggestions = [];
            const queryLower = query.toLowerCase();

            for (const [category, tags] of Object.entries(this.categorizedTags)) {
                for (const tag of tags) {
                    if (tag.name.toLowerCase().includes(queryLower)) {
                        suggestions.push({
                            name: tag.name,
                            category: tag.category,
                            post_count: tag.postCount
                        });
                    }
                }
            }

            return suggestions
                .sort((a, b) => b.post_count - a.post_count)
                .slice(0, 5);
        } catch (error) {
            console.error('[ERROR] Lỗi khi tìm gợi ý tag:', error);
            return [];
        }
    }

    async getPostsFromTag(tag, limit = 5) {
        try {
            const url = `https://danbooru.donmai.us/posts.json?limit=${limit}&tags=${encodeURIComponent(tag)}`;
            const response = await axios.get(url);
            const posts = response.data;

            if (!posts || posts.length === 0) {
                return [];
            }

            return posts.slice(0, limit).map(post => ({
                id: post.id,
                imageUrl: post.file_url,
                tags: post.tag_string,
                source: `https://danbooru.donmai.us/posts/${post.id}`,
                rating: post.rating
            }));
        } catch (error) {
            console.error(`[ERROR] Lỗi khi tải ảnh cho tag: ${tag}`, error);
            return [];
        }
    }
}

module.exports = new TagManager(); 