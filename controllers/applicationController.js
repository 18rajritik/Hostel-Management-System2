const Application = require("../models/Application");
const Room = require("../models/Room");
const { getPagination, sendPaginated } = require("../utils/queryHelpers");

const createApplication = async (req, res, next) => {
  try {
    const activeApplication = await Application.findOne({
      student: req.user._id,
      status: { $in: ["Pending", "Approved"] }
    });

    if (activeApplication) {
      res.status(409);
      throw new Error("You already have an active room application.");
    }

    const application = await Application.create({
      student: req.user._id,
      preferredBlock: req.body.preferredBlock,
      preferredFloor: req.body.preferredFloor,
      notes: req.body.notes
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

const listApplications = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = req.user.role === "admin" ? {} : { student: req.user._id };
    if (req.query.status) filter.status = req.query.status;

    await sendPaginated(
      res,
      Application.find(filter)
        .populate("student", "name email department")
        .populate("allottedRoom", "roomNumber block floor")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Application.countDocuments(filter),
      page,
      limit
    );
  } catch (error) {
    next(error);
  }
};

const updateApplication = async (req, res, next) => {
  try {
    const { status, roomId } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) {
      res.status(404);
      throw new Error("Application not found.");
    }

    if (status === "Approved") {
      const room = await Room.findById(roomId);
      if (!room || room.status === "maintenance" || room.occupants.length >= room.capacity) {
        res.status(400);
        throw new Error("Selected room is not available.");
      }

      if (!room.occupants.some((id) => id.equals(application.student))) {
        room.occupants.push(application.student);
      }
      room.status = room.occupants.length >= room.capacity ? "occupied" : "available";
      await room.save();
      application.allottedRoom = room._id;
    }

    application.status = status || application.status;
    await application.save();
    await application.populate("student", "name email department");
    await application.populate("allottedRoom", "roomNumber block floor");
    res.json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

module.exports = { createApplication, listApplications, updateApplication };
