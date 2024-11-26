import React from 'react';
import CardDataStats from '../../components/CardDataStats';
import { BriefcaseBusiness, Building2, FileUser, User, User2Icon } from 'lucide-react';


const Dashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats title="Tổng số người dùng" total="$3.456K" >
          <User2Icon color='blue' />
        </CardDataStats>
        <CardDataStats title="Tổng số công ty" total="$45,2K">
          <Building2 color='blue' />

        </CardDataStats>
        <CardDataStats title="Tổng số tin tuyển dụng" total="2.450">
          <BriefcaseBusiness color='blue' />
        </CardDataStats>
        <CardDataStats title="Tổng số ứng viên" total="3.456">
          <FileUser color='blue' />

        </CardDataStats>
      </div>

    </>
  );
};

export default Dashboard;
