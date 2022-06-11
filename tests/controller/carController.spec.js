const CarController = require("../../app/controllers/CarController");
const { Car, UserCar } = require("../../app/models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const { CarAlreadyRentedError } = require("../../app/errors");
//const ApplicationController = require("../../app/controllers/ApplicationController");

describe("CarController", () => {
  describe("#handleListCars", () => {
    test("it should be respond with res.status(200) and return list of cars", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        query: {
          size: "Large",
          availableAt: new Date(),
        },
      };

      const mockCarData = {
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      };
      const mockUserCarData = {
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      };

      const cars = [];

      for (let i = 0; i < 10; i++) {
        const mockCar = new Car(mockCarData);
        cars.push(mockCar);
      }

      const mockCarModel = {
        findAll: jest.fn().mockReturnValue(cars),
        count: jest.fn().mockReturnValue(10),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarData,
        dayjs,
      });

      await carController.handleListCars(mockReq, mockRes);

      expect(mockCarModel.findAll).toHaveBeenCalled();
      expect(mockCarModel.count).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        cars,
        meta: {
          pagination: {
            page: 1,
            pageCount: 1,
            pageSize: 10,
            count: 10,
          },
        },
      });
    });
  });

  describe("#handleCreateCar", () => {
    test("it should be respond with res.status(201) and pseudo create car", async () => {
      const mockCarData = {
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      };
      const mockUserCarData = {
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        body: {
          name: "Bugatti",
          price: 44.4,
          size: "Large",
          image: "bugatti.jpg",
        },
      };

      const mockCar = new Car(mockCarData);
      const mockUserCar = new UserCar(mockUserCarData);

      const mockCarModel = { create: jest.fn().mockReturnValue(mockCar) };
      const mockUserCarModel = { mockUserCar };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleCreateCar(mockReq, mockRes);

      expect(mockCarModel.create).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCar);
    });
    test("it should be respond with res.status(422) and some error message", async () => {
      const mockCarData = {
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      };
      const mockUserCarData = {
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        body: {
          name: "Bugatti",
          price: 44.4,
          size: "Large",
          image: "bugatti.jpg",
        },
      };

      const err = new Error("Er RAWR!");
      const mockCarModel = {
        create: jest.fn().mockReturnValue(Promise.reject(err)),
      };
      const mockUserCarModel = { mockUserCarData };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleCreateCar(mockReq, mockRes);

      expect(mockCarModel.create).toHaveBeenCalledWith(mockCarData);
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
        },
      });
    });
  });

  describe("#handleUpdateCar", () => {
    test("it should be respond with res.status(200) and pseudo update some car", async () => {
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        params: {
          id: 1,
        },
        body: {
          name: "Bugatti",
          price: 44.4,
          size: "Large",
          image: "bugatti.jpg",
        },
      };

      const mockCar = new Car({
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      });
      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      mockCar.update = jest.fn().mockReturnThis();
      const mockCarModel = { findByPk: jest.fn().mockReturnValue(mockCar) };
      const mockUserCarModel = { mockUserCar };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleUpdateCar(mockReq, mockRes);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockCar.update).toHaveBeenCalledWith({
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCar);
    });

    test("it should be respond with res.status(422) and print some error", async () => {
      const mockUserCarData = {
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        params: {
          id: 1,
        },
        body: {
          name: "Bugatti",
          price: 44.4,
          size: "Large",
          image: "bugatti.jpg",
        },
      };

      const mockCarModel = { findByPk: jest.fn(() => Promise.reject(err)) };
      const mockCarUserModel = { mockUserCarData };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockCarUserModel,
        dayjs,
      });
      await carController.handleUpdateCar(mockReq, mockRes);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(422);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: {
          name: expect.any(String),
          message: expect.any(String),
        },
      });
    });
  });

  describe("#handleDeleteCar", () => {
    test("it should be respond with res.status(204) and pseudo delete", async () => {
      const mockCarData = {
        id: 1,
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        end: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        params: {
          id: 1,
        },
      };
      const mockCar = new Car(mockCarData);
      mockCar.destroy = jest.fn().mockReturnValue(mockCar);

      const carController = new CarController({ carModel: mockCar });
      await carController.handleDeleteCar(mockReq, mockRes);

      expect(mockCar.destroy).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.end).toHaveBeenCalledWith();
    });
  });

  describe("#handleRentCar", () => {
    test("it should respond with 201 and return some userCar", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      });
      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        body: {
          rentStartedAt: new Date(),
          rentEndedAt: new Date(),
        },
        params: {
          id: 1,
        },
        user: {
          id: 1,
        },
      };

      const mockCarModel = { findByPk: jest.fn().mockReturnValue(mockCar) };
      const mockUserCarModel = {
        findOne: jest.fn().mockReturnValue(null),
        create: jest.fn().mockReturnValue({
          userId: mockUserCar.userId,
          carId: mockUserCar.carId,
          rentStartedAt: mockUserCar.rentStartedAt,
          rentEndedAt: mockUserCar.rentEndedAt,
        }),
      };

      const mockNext = jest.fn();

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleRentCar(mockReq, mockRes, mockNext);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
        where: {
          carId: mockCar.id,
          rentStartedAt: {
            [Op.gte]: mockReq.body.rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: mockReq.body.rentEndedAt,
          },
        },
      });
      expect(mockUserCarModel.create).toHaveBeenCalledWith({
        userId: mockReq.user.id,
        carId: mockCar.id,
        rentStartedAt: mockReq.body.rentStartedAt,
        rentEndedAt: mockReq.body.rentEndedAt,
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test("it shuld return the next function if there is an error", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      });

      const mockCarModel = { findByPk: jest.fn().mockReturnValue(mockCar) };
      const mockUserCarModel = { findOne: jest.fn(() => Promise.reject(err)) };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        body: {
          rentStartedAt: new Date(),
          rentEndedAt: new Date(),
        },
        params: {
          id: 1,
        },
      };
      const mockNext = jest.fn();

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });

      await carController.handleRentCar(mockReq, mockRes, mockNext);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
        where: {
          carId: mockCar.id,
          rentStartedAt: {
            [Op.gte]: mockReq.body.rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: mockReq.body.rentEndedAt,
          },
        },
      });
      expect(mockNext).toHaveBeenCalled();
    });

    test("it should respond with 422 as a status if car has already rented", async () => {
      const mockCar = new Car({
        id: 1,
        name: "Avanza",
        price: "10000",
        size: "small",
        image: "test.jpg",
        isCurrentlyRented: true,
      });
      const mockCarModel = {
        findByPk: jest.fn().mockReturnValue(mockCar),
      };

      const mockUserCar = new UserCar({
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      });
      const mockUserCarModel = {
        findOne: jest.fn().mockReturnValue(mockUserCar),
      };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });

      const req = {
        body: {
          rentStartedAt: new Date(),
          rentEndedAt: new Date(),
        },
        params: {
          id: 1,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await carController.handleRentCar(req, res, next);

      const err = new CarAlreadyRentedError(mockCar);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(req.params.id);
      expect(mockUserCarModel.findOne).toHaveBeenCalledWith({
        where: {
          carId: mockCar.id,
          rentStartedAt: {
            [Op.gte]: req.body.rentStartedAt,
          },
          rentEndedAt: {
            [Op.lte]: req.body.rentEndedAt,
          },
        },
      });
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith({
        error: {
          name: err.name,
          message: err.message,
          details: err.details,
        },
      });

    });
  });

  describe("#handleGetCar", () => {
    test("it should be respond with 200 and retrieved some car data", async () => {
      const mockCarData = {
        id: 1,
        name: "Bugatti",
        price: 44.4,
        size: "Large",
        image: "bugatti.jpg",
        isCurrentlyRented: false,
      };
      const mockUserCarData = {
        userId: 1,
        carId: 1,
        rentStartedAt: new Date(),
        rentEndedAt: new Date(),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const mockReq = {
        params: {
          id: 1,
        },
      };

      const mockCar = new Car(mockCarData);
      const mockUserCar = new UserCar(mockUserCarData);

      const mockCarModel = { findByPk: jest.fn().mockReturnValue(mockCar) };
      const mockUserCarModel = { mockUserCar };

      const carController = new CarController({
        carModel: mockCarModel,
        userCarModel: mockUserCarModel,
        dayjs,
      });
      await carController.handleGetCar(mockReq, mockRes);

      expect(mockCarModel.findByPk).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCar);
    });
  });
});
