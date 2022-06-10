const ApplicationController = require("../../app/Controllers/ApplicationController")
const { NotFoundError } = require("../../app/errors")

describe("ApplicationController", () => {
  const applicationController = new ApplicationController()

  test("#handleGetRoot", () => { 
    const mockJSON = {
      status: "OK",
      message: "BCR API is up and running!",
    }
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    const mockReq = { }

    applicationController.handleGetRoot(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(200)
    expect(mockRes.json).toHaveBeenCalledWith(mockJSON)
  })

  test("#handleNotFound", () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    const mockReq = {
      method: "error",
      url: "http://localhost:8000/error"
    }
    const err = new NotFoundError(mockReq.method, mockReq.url)
  
    applicationController.handleNotFound(mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(404)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        name: err.name,
        message: err.message,
        details: err.details
      }
    })
  })

  test("#handleError", () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    }
    const mockReq = { }
    const err = new Error("Error")
    
    applicationController.handleError(err, mockReq, mockRes)

    expect(mockRes.status).toHaveBeenCalledWith(500)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: {
        name: err.name,
        message: err.message,
        details: err.details || null
      }
    })
  })

  test('#getOffsetFromRequest', () => {
    const mockReq = {
      query: {
        page: 1,
        pageSize: 10
      }
    }

    const offset = applicationController.getOffsetFromRequest(mockReq)
    expect(offset).toEqual(0)
  })

  test('#buildPaginationObject', () => {
    const mockReq = {
      query: {
        page: 1,
        pageSize: 10
      }
    }

    const mockCount = 10
    const returnValue = applicationController.buildPaginationObject(mockReq, mockCount)

    expect(returnValue).toEqual({
      page: 1,
      pageCount: 1,
      pageSize: 10,
      count: mockCount
    })
  })
})