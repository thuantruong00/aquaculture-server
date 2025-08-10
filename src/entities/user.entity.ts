import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import { UserRole, UserStatus } from "~/utils/enum";

export interface IUser extends Document {
  username: string;
  password: string;
  salt: string;
  nickname?: string;
  email?: string;
  role: UserRole;
  status: UserStatus;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    salt: {
      type: String,
      required: true,
    },

    nickname: {
      type: String,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },

    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Hash password trước khi lưu
UserSchema.pre("save", async function (next) {
  const user = this as IUser;
  if (!user.isModified("password")) return next();

  try {
    user.password = await bcrypt.hash(user.password, user.salt);
    next();
  } catch (err) {
    next(err as any);
  }
});

// 🔑 So sánh password khi đăng nhập
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>("User", UserSchema);
