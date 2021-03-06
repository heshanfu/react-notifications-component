import notificationObject from "tests/mocks/notification.mock";
import { cssWidth } from "src/utils";
import {
  isBottomContainer,
  isTopContainer,
  shouldNotificationHaveSliding,
  getHtmlClassesForType,
  getNotificationsForMobileView,
  getCubicBezierTransition,
  hasFullySwiped,
  getRootHeightStyle,
  getNotificationsForEachContainer,
  htmlClassesForUserDefinedType
} from "src/helpers";

import {
  validateWidth,
  validateInsert,
  validateDismissable,
  validateTimeoutDismissOption,
  validateTransition,
  validateTitle,
  validateMessage,
  validateType,
  validateContainer,
  validateUserDefinedTypes
} from "src/validators";

import {
  CONTAINER,
  INSERTION,
  NOTIFICATION_TYPE,
  NOTIFICATION_BASE_CLASS,
  NOTIFICATION_STAGE
} from "src/constants";

describe("test suite for helpers", () => {
  it("container is bottom", () => {
    expect(isBottomContainer(CONTAINER.BOTTOM_LEFT)).toBe(true);
    expect(isBottomContainer(CONTAINER.BOTTOM_RIGHT)).toBe(true);
  });

  it("container is not bottom", () => {
    expect(isBottomContainer(CONTAINER.TOP_LEFT)).toBe(false);
    expect(isBottomContainer(CONTAINER.TOP_RIGHT)).toBe(false);
  });

  it("container is top", () => {
    expect(isTopContainer(CONTAINER.TOP_LEFT)).toBe(true);
    expect(isTopContainer(CONTAINER.TOP_RIGHT)).toBe(true);
  });

  it("container is not top", () => {
    expect(isTopContainer(CONTAINER.BOTTOM_LEFT)).toBe(false);
    expect(isTopContainer(CONTAINER.BOTTOM_RIGHT)).toBe(false);
  });

  it("notification will slide", () => {
    // expect to have sliding for top/top
    expect(shouldNotificationHaveSliding({
      insert: INSERTION.TOP,
      container: CONTAINER.TOP_LEFT
    })).toBe(true);

    // expect to have sliding for bottom/bottom
    expect(shouldNotificationHaveSliding({
      insert: INSERTION.BOTTOM,
      container: CONTAINER.BOTTOM_LEFT
    })).toBe(true);
  });

  it("notification will not slide", () => {
    // no sliding for bottom/top combination
    expect(shouldNotificationHaveSliding({
      insert: INSERTION.BOTTOM,
      container: CONTAINER.TOP_LEFT
    })).toBe(false);

    // no sliding for top/bottom combination
    expect(shouldNotificationHaveSliding({
      insert: INSERTION.TOP,
      container: CONTAINER.BOTTOM_LEFT
    })).toBe(false);
  });

  it("width is set in pixels", () => {
    expect(cssWidth(undefined)).toBeUndefined();
    expect(cssWidth(100)).toMatch("100px");
  });

  it("corresponding array of CSS classes is returned for an existing type", () => {
    const type = NOTIFICATION_TYPE;
    const baseClass = NOTIFICATION_BASE_CLASS;

    // expect to return corresponding CSS class for each defined notification type
    expect(getHtmlClassesForType({ type: type.DEFAULT })).toEqual([baseClass, "notification-default"]);
    expect(getHtmlClassesForType({ type: type.SUCCESS })).toEqual([baseClass, "notification-success"]);
    expect(getHtmlClassesForType({ type: type.DANGER })).toEqual([baseClass, "notification-danger"]);
    expect(getHtmlClassesForType({ type: type.WARNING })).toEqual([baseClass, "notification-warning"]);
    expect(getHtmlClassesForType({ type: type.INFO })).toEqual([baseClass, "notification-info"]);
  });

  it("corresponding array of CSS classes is returned for a custom type", () => {
    const baseClass = NOTIFICATION_BASE_CLASS;

    // define custom types
    const userDefinedTypes = [{ name: "awesome", htmlClasses: ["awesome"] }];

    // expect to return custom type
    expect(getHtmlClassesForType({ type: "awesome", userDefinedTypes })).toEqual([baseClass, "awesome"])
  });

  it("custom types are case-sensitive", () => {
    // expect to throw for case differences
    expect(() => getHtmlClassesForType({ type: "AWESOME", userDefinedTypes })).toThrow();
  })

  it("notifications for mobile are returned", () => {
    let notifications = [
      { container: CONTAINER.TOP_LEFT },
      { container: CONTAINER.TOP_RIGHT },
      { container: CONTAINER.BOTTOM_LEFT },
      { container: CONTAINER.BOTTOM_RIGHT }
    ];

    // expect not to throw expection for this scenario
    expect(() => getNotificationsForMobileView(notifications)).not.toThrow();

    // notifications for mobile
    let result = getNotificationsForMobileView(notifications);

    // expect to have have both top and bottom
    expect(result.top.length).toBe(2);
    expect(result.bottom.length).toBe(2);

    // expect to throw for invalid container
    expect(() => getNotificationsForMobileView([{ container: "" }])).toThrow();
  });

  it("notifications for desktop are returned", () => {
    let result = getNotificationsForEachContainer([
      { container: CONTAINER.TOP_LEFT },
      { container: CONTAINER.TOP_RIGHT },
      { container: CONTAINER.BOTTOM_LEFT },
      { container: CONTAINER.BOTTOM_RIGHT }
    ]);

    // expect each container to be filled in
    expect(result.topLeft.length).toBe(1);
    expect(result.topRight.length).toBe(1);
    expect(result.bottomLeft.length).toBe(1);
    expect(result.bottomRight.length).toBe(1);

    // expect to throw for invalid container
    expect(() => getNotificationsForEachContainer([{ container: "" }])).toThrow();
  });

  it("CSS transition is properly returned based on duration|property|type|delay", () => {
    // no arguments supplied
    expect(getCubicBezierTransition()).toBe("500ms height linear 0ms");

    // only duration supplied
    expect(getCubicBezierTransition(800)).toBe("800ms height linear 0ms");

    // duration and easing
    expect(getCubicBezierTransition(800, "ease-out")).toBe("800ms height ease-out 0ms");

    // duration, easing, delay
    expect(getCubicBezierTransition(800, "ease-out", 100)).toBe("800ms height ease-out 100ms");

    // duration, easing, delay, property
    expect(getCubicBezierTransition(800, "ease-out", 200, "all")).toBe("800ms all ease-out 200ms");
  });

  it("notification swipes completely", () => {
    global.window.innerWidth = 100;
    expect(hasFullySwiped(40)).toBe(true);
  });

  it("notification does not swipe completely", () => {
    global.window.innerWidth = 100;
    expect(hasFullySwiped(35)).toBe(false);
  });

  it("root element's style is properly set", () => {
    const slidingExit = { duration: 250, cubicBezier: "ease-out", delay: 100 };
    const notification = Object.assign({}, notificationObject, { slidingExit });

    // get style for root element
    const rootStyle = getRootHeightStyle(notification, 100);

    // height set on root element
    expect(rootStyle.height).toBe("100px");

    // transition has been set
    expect(rootStyle.transition).toBe("250ms height ease-out 100ms");
  });

  it("validates dismiss icon option", () => {
    // expect to throw if `className` is not defined
    expect(() => validateDismissIconOption({})).toThrow();

    // expect to throw if `className` is not String
    expect(() => validateDismissIconOption({ className: false })).toThrow();

    // expect to throw if `content` is not defined
    expect(() => validateDismissIconOption({ className: [] })).toThrow();

    // expect to throw if `content` is not a valid React element
    expect(() => validateDismissIconOption({ className: [], content: [] })).toThrow();
  });

  it("validates timeout dismiss option", () => {
    // expect normal behaviour
    expect(() => validateTimeoutDismissOption()).not.toThrow();

    // expect to throw if duration is not set
    expect(() => validateTimeoutDismissOption({})).toThrow();

    // expect to throw for NaN duration
    expect(() => validateTimeoutDismissOption({ duration: "" })).toThrow();

    // expect to throw for negative duration
    expect(() => validateTimeoutDismissOption({ duration: -100 })).toThrow();
  });

  it("validates generic transition option", () => {
    const defaults = {
      duration: 1000,
      cubicBezier: "linear",
      delay: 0
    };

    // expect values to be set properly
    expect(validateTransition({
      duration: 300,
      cubicBezier: "ease-in",
      delay: 200
    }, defaults)).toEqual({
      duration: 300,
      cubicBezier: "ease-in",
      delay: 200
    });

    // expect default values to be set
    expect(validateTransition({}, defaults)).toEqual(defaults);

    // expect to throw for NaN duration
    expect(() => validateTransition({ duration: "" }, defaults)).toThrow();

    // expect to throw for `cubicBezier` is not String
    expect(() => validateTransition({ cubicBezier: 0 }, defaults)).toThrow();

    // expect to throw for NaN delay
    expect(() => validateTransition({ delay: "" }, defaults)).toThrow();
  });

  it("validates title option", () => {
    // expect to skip for defined `content`
    expect(validateTitle({ content: {} })).toBeUndefined();

    // expect not to throw for undefined message
    expect(() => validateTitle({})).not.toThrow();

    // expect to throw for non String values
    expect(() => validateTitle({ title: 0 })).toThrow();
  });

  it("validates message option", () => {
    // expect to skip for defined `content`
    expect(validateMessage({ content: {} })).toBeUndefined();

    // expect to throw for undefined
    expect(() => validateMessage({})).toThrow();

    // expect to throw for non String values
    expect(() => validateMessage({ message: 0 })).toThrow();
  });

  it("validates type option", () => {
    // expect to return if content is set
    expect(validateType({ content: {} })).toBeUndefined();

    // expect to throw for undefined type
    expect(() => validateType()).toThrow();

    // expect to throw if type is not string
    expect(() => validateType({ type: {} })).toThrow();

    expect(validateType({ type: NOTIFICATION_TYPE.SUCCESS })).toBe("success");
  });

  it("validates container option", () => {
    expect(() => validateContainer()).toThrow();
    expect(() => validateContainer({})).toThrow();

    // expect lower case result
    expect(validateContainer("TOP")).toBe("top");
  })

  it("validates dismissable option", () => {
    const defaults = { click: true, touch: true };
    expect(validateDismissable()).toEqual(defaults);

    // expect empty object to match defaults
    expect(validateDismissable({})).toEqual(defaults);

    // test all possible T/F combinations
    expect(validateDismissable({ click: true, touch: true })).toEqual({ click: true, touch: true });
    expect(validateDismissable({ click: true, touch: false })).toEqual({ click: true, touch: false });
    expect(validateDismissable({ click: false, touch: true })).toEqual({ click: false, touch: true });
    expect(validateDismissable({ click: false, touch: false })).toEqual({ click: false, touch: false });

    // expect to throw for non boolean values
    expect(() => validateDismissable({ click: "true" })).toThrow();

    // expect to throw for non boolean values
    expect(() => validateDismissable({ touch: "true" })).toThrow();
  });

  it("validates user defined types", () => {
    const definedTypes = [{ name: "awesome" }];

    expect(validateUserDefinedTypes({ content: {} }, definedTypes)).toBeUndefined();
    expect(validateUserDefinedTypes({ type: NOTIFICATION_TYPE.SUCCESS }, definedTypes)).toBeUndefined();

    // should throw if type cannot be found
    expect(() => validateUserDefinedTypes({ type: "xtra" }, definedTypes)).toThrow();

    // expect not to throw
    expect(() => validateUserDefinedTypes({ type: "awesome" }, definedTypes)).not.toThrow();
  });

  it("validates insert option", () => {
    // expect default to be returned
    expect(validateInsert()).toBe("top");

    // expect actual value to be returned
    expect(validateInsert("top")).toBe("top");
    expect(validateInsert("bottom")).toBe("bottom");

    // expect to throw for NaN values
    expect(() => validateInsert({})).toThrow();
  });

  it("validates width option", () => {
    expect(validateWidth(100)).toBe(100);

    // expect to throw for NaN values
    expect(() => validateWidth({ width: {} })).toThrow();
  });
});