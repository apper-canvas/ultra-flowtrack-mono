import { getApperClient } from "@/services/apperClient"

export const taskService = {
async getAll() {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.fetchRecords('task_c', {
        fields: [
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "attachment_c"}}
        ],
        orderBy: [{"fieldName": "createdAt_c", "sorttype": "DESC"}]
      })

      if (!response.success) {
        console.error(response.message)
        return []
      }

      return response.data || []
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error)
      return []
    }
  },

async getById(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.getRecordById('task_c', parseInt(id), {
        fields: [
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "createdAt_c"}},
          {"field": {"Name": "completedAt_c"}},
          {"field": {"Name": "attachment_c"}}
        ]
      })

      if (!response.success) {
        console.error(response.message)
        return null
      }

      return response.data
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error)
      return null
    }
  },

async create(taskData) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.createRecord('task_c', {
        records: [{
          title_c: taskData.title_c,
          description_c: taskData.description_c,
          priority_c: taskData.priority_c,
          status_c: taskData.status_c,
          createdAt_c: taskData.createdAt_c,
          completedAt_c: taskData.completedAt_c,
          attachment_c: taskData.attachment_c
        }]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} tasks:${failed}`)
          failed.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }

        return successful[0]?.data
      }
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async update(id, updates) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.updateRecord('task_c', {
        records: [{
          Id: parseInt(id),
          ...updates
        }]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success)
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} tasks:${failed}`)
          failed.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }

        return successful[0]?.data
      }
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error)
      throw error
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient()
      const response = await apperClient.deleteRecord('task_c', {
        RecordIds: [parseInt(id)]
      })

      if (!response.success) {
        console.error(response.message)
        throw new Error(response.message)
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success)

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} tasks:${failed}`)
          failed.forEach(record => {
            if (record.message) throw new Error(record.message)
          })
        }

        return true
      }
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error)
      throw error
    }
  }
}