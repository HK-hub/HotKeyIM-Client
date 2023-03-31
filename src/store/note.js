import {defineStore} from 'pinia'
import {
    ServeGetArticleDetail,
    ServeGetArticleClass,
    ServeGetArticleTag,
    ServeGetArticleList,
    ServeEditArticleClass,
    ServeEditArticleTag,
    ServeDeleteArticleClass,
    ServeDeleteArticleTag,
} from '@/api/article'

const userId = JSON.parse(localStorage.getItem('IM_USERID')).value
export const useNoteStore = defineStore('note', {
    state: () => {
        return {
            tags: [],
            class: [],

            notes: {
                loadStatus: 0,
                params: {page: 1, keyword: '', find_type: 1, cid: 0},
                items: [],
            },

            view: {
                editorMode: 'preview',
                loadId: 0,
                loadStatus: 0,
                detail: {
                    id: 0,
                    categoryId: 0,
                    category: {},
                    categoryName: '',
                    title: '',
                    // 星标
                    stared: 0,
                    status: 1,
                    tags: [],
                    files: [],
                    content: '',
                    mdContent: '',
                    createTime: '',
                    updateTIme: '',
                },
            },
        }
    },

    actions: {
        close() {
            this.view.loadId = 0
        },

        addNewNote(class_id = 0) {
            this.view.detail = {
                id: 0,
                categoryId: class_id,
                category: {},
                categoryName: '',
                title: '请编辑标题！！！',
                // 星标
                stared: 0,
                status: 1,
                tags: [],
                files: [],
                content: '',
                mdContent: '',
                createTime: '',
            }

            this.view.loadId = 1
            this.view.loadStatus = 1

            this.setEditorMode('edit')

            this.loadClass()
        },

        // 加载分类
        loadClass() {
            ServeGetArticleClass().then(({code, data}) => {
                console.log('加载笔记分类列表：', data)
                if (code != 200) return false

                this.class = data
            })
        },

        // 加载标签
        loadTags() {
            ServeGetArticleTag().then(res => {
                console.log('加载笔记标签列表：', res.data)
                if (res.success == false) return false

                this.tags = res.data
            })
        },

        loadNoteList(params = {}, isReset = true) {
            if (isReset) {
                Object.assign(
                    this.notes.params,
                    {page: 1, keyword: '', find_type: 1, cid: 0},
                    params
                )
            } else {
                Object.assign(this.notes.params, params)
            }

            this.notes.loadStatus = 0
            this.notes.items = []
            this.notes.params
            ServeGetArticleList({
                userId: userId,
                page: this.notes.params.page,
                keyword: this.notes.params.keyword,
                findType: this.notes.params.find_type,
                cid: this.notes.params.cid,
            }).then(res => {
                console.log('笔记查询结果：', res)
                this.notes.items = res.data

                this.notes.loadStatus = 1
            })
        },

        updateNoteItem(id, params = {}) {
            const item = this.notes.items.find(item => item.id == id)

            item && Object.assign(item, params)
        },

        // 加载详情信息
        loadDetail(id) {
            this.view.loadId = id
            this.view.loadStatus = 0

            this.setEditorMode('preview')

            ServeGetArticleDetail({
                noteId: id,
            }).then(({code, data}) => {
                if (code != 200 && data.id != this.view.loadId) {
                    return
                }

                this.view.loadStatus = 1

                data.category.name = ''
                this.view.detail = data

                console.log()
                let node = this.class.find(item => {
                    return item.id == data.category.id
                })

                this.view.detail.categoryName = node.name || ''
                this.view.detail.categoryId = node.id
                this.view.detail.category = node
            })
        },

        // 修改编辑模式
        setEditorMode(value) {
            this.view.editorMode = value
        },

        // 修改收藏状态
        setCollectionStatus(isTrue) {
            this.view.detail.stared = isTrue ? true : false
        },

        // 编辑分类
        async editClass(class_id, class_name) {
            const res = await ServeEditArticleClass({
                categoryId: class_id,
                name: class_name,
                userId: userId,
                description: class_name,
                avatar: '',
            })
            console.log('编辑文章分类：', res)
            if (res && res.success === true) {
                if (class_id === 0) {
                    this.class.unshift({
                        id: res.data.id,
                        name: class_name,
                        count: 0,
                    })
                } else {
                    const item = this.class.find(item => item.id === class_id)
                    item && Object.assign(item, {name: class_name})
                }
            }
        },

        async deleteClass(class_id) {
            const res = await ServeDeleteArticleClass({class_id})

            if (res && res.code == 200) {
                const index = this.class.findIndex(item => item.id === class_id)

                if (index >= 0) {
                    this.class.splice(index, 1)
                }
            } else {
                $message.info(res.message)
            }
        },

        // 编辑标签
        async editTag(tag_id, tag_name) {
            const res = await ServeEditArticleTag({
                tagId: tag_id,
                name: tag_name,
            })
            console.log('编辑标签结果：', res)
            if (res && res.code === 200) {
                if (tag_id === 0) {
                    this.tags.unshift({name: tag_name, count: 0, id: res.data.id})
                } else {
                    const item = this.tags.find(item => item.id === tag_id)
                    item && Object.assign(item, {name: tag_name})
                }
            }
        },

        async deleteTag(tag_id) {
            const res = await ServeDeleteArticleTag({
                tagId: tag_id
            })

            if (res.success && res.code == 200) {
                const index = this.tags.findIndex(item => item.id === tag_id)

                if (index >= 0) {
                    this.tags.splice(index, 1)
                }
            } else {
                $message.info(res.data || res.message)
            }
        },
    },
})
