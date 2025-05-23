const QueryBuilder = require("../../../builder/queryBuilder");
const { ENUM_USER_ROLE } = require("../../../util/enum");
const validateFields = require("../../../util/validateFields");
const AdminNotification = require("../adminNotification/adminNotification.model");
const Notification = require("./notification");

const getAllNotifications = async (user, query) => {
  if (user.role === ENUM_USER_ROLE.ADMIN) {
    const notificationQuery = new QueryBuilder(
      AdminNotification.find({}),
      query
    )
      .search([""])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await notificationQuery.modelQuery;
    const meta = await notificationQuery.countTotal();

    return { meta, result };
  }

  const notificationQuery = new QueryBuilder(
    Notification.find({ toId: user.userId }),
    query
  )
    .search([""])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await notificationQuery.modelQuery;
  const meta = await notificationQuery.countTotal();

  return { meta, result };
};

const markAsRead = async (user, payload) => {
  validateFields(payload, ["notificationId"]);

  const notification = await Notification.findOneAndUpdate(
    { _id: payload.notificationId, toId: user.userId },
    [{ $set: { isRead: { $not: "$isRead" } } }]
  );

  return notification;
};

const deleteNotification = async (user, payload) => {
  validateFields(payload, ["notificationId"]);

  const notification = await Notification.findOneAndDelete({
    toId: user.userId,
    _id: payload.notificationId,
  });

  return notification;
};

const NotificationService = {
  getAllNotifications,
  markAsRead,
  deleteNotification,
};

module.exports = NotificationService;
