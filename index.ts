type Workout = "Weight" | "Cardio";

class Slot {
  id: string;
  time: string;
  workout: Workout;
  capacity: number;
  attenders: string[] = [];
  date: string;

  constructor(
    id: string,
    time: string,
    workout: Workout,
    date: string,
    capacity: number = 3
  ) {
    this.id = id;
    this.time = time;
    this.workout = workout;
    this.date = date;
    this.capacity = capacity;
  }

  slotAvailable(): boolean {
    return this.attenders.length < this.capacity;
  }

  book(userId: string): boolean {
    if (this.slotAvailable()) {
      this.attenders.push(userId);
      return true;
    }
    return false;
  }

  getDetails(): void {
    console.log(
      `Slot ID: ${this.id}, Date: ${this.date}, Time: ${this.time}, Workout: ${this.workout}, Capacity: ${this.capacity}, Booked: ${this.attenders.length}`
    );
  }
}

class Center {
  id: string;
  name: string;
  slots: Slot[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  addSlot(slot: Slot): void {
    this.slots.push(slot);
  }

  getSlots(date: string): Slot[] {
    return this.slots.filter((s) => s.date === date);
  }

  getSlotById(date: string, slotId: string): Slot | undefined {
    return this.slots.find((s) => s.date === date && s.id === slotId);
  }

  getDetails(): void {
    console.log(`Center ${this.name}, ID: ${this.id}`);
  }
}

class Booking {
  date: string;
  user: Member;
  center: Center;
  slot: Slot;

  constructor(date: string, user: Member, center: Center, slot: Slot) {
    this.date = date;
    this.user = user;
    this.center = center;
    this.slot = slot;
  }

  getDetails(): void {
    console.log(
      `Date: ${this.date}, Center name: ${this.center.name}, Time: ${this.slot.time}, Workout: ${this.slot.workout}`
    );
  }
}
abstract class User {
  id: string;
  name: string;
  email: string;
  bookings: Booking[] = [];

  constructor(id: string, name: string, email: string) {
    if (new.target === User) {
      throw new Error("Error");
    }
    this.id = id;
    this.name = name;
    this.email = email;
  }

  addBooking(booking: Booking): void {
    this.bookings.push(booking);
  }

  getBookingsForDay(date: string): Booking[] {
    return this.bookings.filter((b) => b.date === date);
  }

  abstract getDetails(): void;
}

class Member extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email);
  }
  getDetails(): void {
    console.log(`User: ${this.name}, ID: ${this.id}`);
    if (this.bookings.length > 0) {
      this.bookings.forEach((b) => {
        console.log(
          `${b.date} at ${b.slot.time} of ${b.slot.workout} at ${b.center.name}`
        );
      });
    } else {
      console.log("No bookings");
    }
  }
}

class Admin extends User {
  constructor(id: string, name: string, email: string) {
    super(id, name, email);
  }
  getDetails(): void {
    console.log(`Admin: ${this.name}, ID: ${this.id}`);
  }

  addMembers(filipFit: FlipFit, name: string, email: string): string {
    return filipFit.addMember(name, email);
  }

  addSlots(
    filipFit: FlipFit,
    centerId: string,
    slotId: string,
    time: string,
    workout: Workout,
    date: string,
    capacity: number
  ): void {
    const center = filipFit.findCenter(centerId);
    if (!center) {
      console.log("Center is not found");
      return;
    }

    const inSlot = center.getSlotById(date, slotId);
    if (inSlot) {
      console.log("Slot is already added");
      return;
    }

    const newSlot = new Slot(slotId, time, workout, date, capacity);
    center.addSlot(newSlot);
    console.log(`Slot ${slotId} added to center ${center.name}`);
  }

  updateSlotCapacity(
    filipFit: FlipFit,
    centerId: string,
    slotId: string,
    date: string,
    newCapacity: number
  ): void {
    const center = filipFit.findCenter(centerId);
    if (!center) {
      console.log("Center not found");
      return;
    }

    const slot = center.getSlotById(date, slotId);
    if (!slot) {
      console.log("Slot not found");
      return;
    }

    if (newCapacity < slot.attenders.length) {
      console.log("new capacity is less then bookings");
      return;
    }

    slot.capacity = newCapacity;
    console.log(`Update new capacity slot ${slotId} to ${newCapacity}`);
  }
}

class FlipFit {
  centers: Center[] = [];
  members: Member[] = [];
  bookings: Booking[] = [];
  userId: number = 1;

  constructor() {
    this.centers.push(new Center("C001", "Koramangala"));
    this.centers.push(new Center("C002", "Bellandur"));
  }

  addMember(name: string, email: string) {
    const inUser = this.members.find((u) => u.email === email);

    if (inUser) {
      console.log("User is already added");
      return inUser.id;
    }

    const userId = String(this.userId++);
    const newUser = new Member(userId, name, email);
    this.members.push(newUser);
    console.log(`User: ${name} is added ID: ${userId}`);
    return userId;
  }

  findUser(userId: string): Member | undefined {
    return this.members.find((u) => u.id === userId);
  }

  findCenter(centerId: string): Center | undefined {
    return this.centers.find((c) => c.id === centerId);
  }

  viewWorkouts(date: string): void {
    this.centers.forEach((center) => {
      console.log(`Center ${center.name}, ID: ${center.id}`);
      const slots = center.getSlots(date);
      if (slots.length > 0) {
        slots.forEach((slot) => {
          console.log(
            `Slot ID: ${slot.id}, Time: ${slot.time}, Workout: ${slot.workout}, Capacity: ${slot.capacity}, Booked: ${slot.attenders.length}`
          );
        });
      } else {
        console.log("No slots available");
      }
    });
  }
  bookWorkout(
    userId: string,
    centerId: string,
    slotId: string,
    date: string
  ): void {
    const user = this.findUser(userId);
    if (!user) {
      console.log("User not registered");
      return;
    }

    const center = this.findCenter(centerId);
    if (!center) {
      console.log("Center is not available");
      return;
    }

    const slot = center.getSlotById(date, slotId);
    if (!slot) {
      console.log("Slot not found");
      return;
    }

    if (!slot.slotAvailable()) {
      console.log("Slot is fully booked");
      return;
    }

    const duplicate = user.bookings.find(
      (b) =>
        b.date === date &&
        b.center.id === centerId &&
        b.slot.time === slot.time &&
        b.slot.workout === slot.workout
    );
    if (duplicate) {
      console.log("Duplicate entry is not allowed");
      return;
    }

    const booked = slot.book(userId);

    if (booked) {
      const booking = new Booking(date, user, center, slot);
      user.addBooking(booking);
      this.bookings.push(booking);

      console.log(
        `Booking successfull. Booking ID: ${userId}-${slotId}-${date} | Slot: ${slot.time}, Workout: ${slot.workout}`
      );
    } else {
      console.log("Booking Failed");
    }
  }

  viewUserPlan(userId: string, date: string): void {
    const user = this.findUser(userId);
    if (!user) {
      console.log("User not found");
    }
    if (user) {
      const bookings = user.getBookingsForDay(date);
      console.log(`User ${user.name}, ID: ${user.id}`);

      if (bookings.length > 0) {
        bookings.forEach((b) => {
          console.log(
            `Time: ${b.slot.time}, Workout: ${b.slot.workout}, Center: ${b.center.name}`
          );
        });
      } else {
        console.log("No bookings available");
      }
    }
  }
}

const filipFit = new FlipFit();
const admin = new Admin("A001", "Admin", "admin@gmail.com");

const user1 = admin.addMembers(filipFit, "Abc", "abc@gmail.com.com");
const user2 = admin.addMembers(filipFit, "Def", "def@gmail.com.com");
const user3 = admin.addMembers(filipFit, "Ghi", "ghi@gmail.com.com");

admin.addSlots(filipFit, "C001", "S001", "07:00", "Cardio", "2025-06-30", 3);
admin.addSlots(filipFit, "C001", "S002", "08:00", "Weight", "2025-06-30", 3);
admin.addSlots(filipFit, "C002", "S003", "09:00", "Cardio", "2025-06-30", 3);

admin.updateSlotCapacity(filipFit, "C001", "S001", "2025-06-30", 5);

filipFit.viewWorkouts("2025-06-30");

filipFit.bookWorkout(user1, "C001", "S001", "2025-06-30");
filipFit.bookWorkout(user2, "C001", "S001", "2025-06-30");
filipFit.bookWorkout(user3, "C001", "S001", "2025-06-30");
filipFit.bookWorkout(user1, "C001", "S002", "2025-06-30");
filipFit.bookWorkout(user1, "C002", "S003", "2025-06-30");
filipFit.bookWorkout(user1, "C001", "S001", "2025-06-30");
filipFit.bookWorkout("999", "C001", "S001", "2025-06-30");
filipFit.bookWorkout(user2, "C999", "S001", "2025-06-30");
filipFit.bookWorkout(user3, "C001", "S999", "2025-06-30");

filipFit.viewUserPlan(user1, "2025-06-30");
filipFit.viewUserPlan(user2, "2025-06-30");
filipFit.viewUserPlan(user3, "2025-06-30");
filipFit.viewUserPlan("999", "2025-06-30");