import { Home } from "lucide-react";

const BreadCrumb = ({title, parent, child}) => {
    return (
      <div className='flex flex-col sm:flex-row px-2 sm:px-4 justify-between items-start sm:items-center gap-2 sm:gap-0'>
        <div className="flex flex-col gap-1">
          <h3 className='text-lg sm:text-xl md:text-3xl font-bold !text-(--primary-color)'>{title}</h3>
          <p className='text-xs sm:text-sm md:text-md !text-(--primary-color)'>ADMIN PANEL</p>
        </div>
  
        <div className="flex gap-1 md:gap-2 items-center text-sm sm:text-base">
          <div className='bg-[#cceeec] w-10 h-10 rounded-full flex justify-center items-center'>
            <Home color="white" className='text-sm sm:text-base'/>
          </div>
          <span className='mx-1'>/</span>
          <p className='font-bold !text-(--primary-color)'>
            {parent}
          </p>
          <span className='mx-1'>/</span>
          <p className="!text-(--primary-color)">{child}</p>
        </div>
      </div>
    );
  };

  export default BreadCrumb;