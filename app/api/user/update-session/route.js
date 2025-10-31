// app/api/user/update-session/route.js
import { auth } from "@/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const dbUser = await User.findOne({ email: session.user.email });
  
  return Response.json({
    id: dbUser._id.toString(),
    role: dbUser.role,
  });
}