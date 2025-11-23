import Link from "next/link";
import BackgroundImage from "../assets/homepage.jpg";

export default function Home() {
  return (
    <div className="bg-blue-100 bg-home bg-no-repeat bg-cover min-h-dvh flex items-center justify-center bg-fixed" style={{ backgroundImage: `url(${BackgroundImage.src})` }}>
      <div className="flex flex-col">
        <h1 className="text-8xl mb-5 p-4 text-center text-white">Unigrade</h1>
        <p className="p-2 text-center text-white">Platform for students</p>
        <p className="text-center mb-10 text-white">View courses, plan your studying, find internships</p>
        <Link href="/dashboard" className='w-full text-2xl bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-full transition ease-in-out delay-20 duration-300 hover:translate-y-0.5 text-center'>
          <span>Get started</span>
        </Link>
      </div>
    </div>
  );
};