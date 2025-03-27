const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'tagCache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24H

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
    }

    async loadCache() {
        try {
            const data = await fs.readFile(CACHE_FILE, 'utf8');
            const cache = JSON.parse(data);
            this.tags = new Map(Object.entries(cache.tags));
            this.categorizedTags = cache.categorizedTags;
            this.lastUpdate = new Date(cache.lastUpdate);
            
            // Kiểm tra thời gian cập nhật cuối cùng
            const timeSinceLastUpdate = Date.now() - this.lastUpdate.getTime();
            const hoursRemaining = Math.floor((CACHE_DURATION - timeSinceLastUpdate) / (60 * 60 * 1000));
            
            if (timeSinceLastUpdate < CACHE_DURATION) {
                console.log(`[INFO] Cache còn hợp lệ, còn ${hoursRemaining} giờ nữa mới cần cập nhật`);
                return true;
            } else {
                console.log('[INFO] Cache đã hết hạn, cần cập nhật');
                return false;
            }
        } catch (error) {
            console.log('[WARNING] Không tìm thấy cache hoặc cache bị hỏng');
            return false;
        }
    }

    async saveCache() {
        try {
            const cache = {
                tags: Object.fromEntries(this.tags),
                categorizedTags: this.categorizedTags,
                lastUpdate: this.lastUpdate.toISOString()
            };
            await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
            console.log('[INFO] Đã lưu cache thành công');
            return true;
        } catch (error) {
            console.error('[ERROR] Lỗi khi lưu cache:', error);
            return false;
        }
    }

    async updateTags() {
        try {
            // Kiểm tra cache trước khi cập nhật
            const cacheValid = await this.loadCache();
            if (cacheValid) {
                console.log('[INFO] Sử dụng cache hiện tại');
                return true;
            }

            console.log('[INFO] Bắt đầu cập nhật tags...');
            this.tags.clear();
            this.categorizedTags = {};
            let page = 1;
            let allTags = [];

            while (true) {
                console.log(`[INFO] Đang tải trang ${page}...`);
                try {
                    const url = `https://danbooru.donmai.us/tags.json?limit=1000&page=${page}&search[order]=count&search[hide_empty]=true`;
                    const response = await axios.get(url);
                    const tags = response.data;

                    if (!tags || tags.length === 0) {
                        console.log('[INFO] Không còn tag nào để tải!');
                        break;
                    }

                    allTags.push(...tags);
                    page++;
                    
                    // Thêm delay để tránh rate limit
                    // await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (error) {
                    if (error.response && error.response.status === 410) {
                        console.log('[INFO] Đã đạt đến giới hạn trang.');
                        break;
                    }
                    throw error;
                }
            }

            console.log(`[INFO] Đã tải tổng cộng ${allTags.length} tags. Đang phân loại...`);

            // Lọc các tag có post_count > 0
            const validTags = allTags.filter(tag => tag.post_count > 0);

            // Phân loại tags
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
            await this.saveCache();
            console.log(`[INFO] Đã lưu ${this.tags.size} tags vào cache!`);
            return true;
        } catch (error) {
            console.error('[ERROR] Lỗi khi cập nhật tags:', error);
            return false;
        }
    }

    async getSuggestions(query) {
        try {
            // Kiểm tra và cập nhật cache nếu cần
            await this.updateTags();

            const suggestions = [];
            const queryLower = query.toLowerCase();

            // Tìm kiếm trong tất cả các category
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
            console.log(`[INFO] Đang tải ảnh cho tag: ${tag}...`);
            const url = `https://danbooru.donmai.us/posts.json?limit=${limit}&tags=${encodeURIComponent(tag)}`;
            const response = await axios.get(url);
            const posts = response.data;

            if (!posts || posts.length === 0) {
                console.log(`[WARNING] Không tìm thấy ảnh cho tag: ${tag}`);
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

    isCacheExpired() {
        if (!this.lastUpdate) return true;
        return Date.now() - this.lastUpdate.getTime() > CACHE_DURATION;
    }
}

module.exports = new TagManager(); 