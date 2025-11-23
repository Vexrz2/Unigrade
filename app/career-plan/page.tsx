"use client";

import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/UserContext';
import api from '../../lib/api';
import { IoIosSearch } from 'react-icons/io';
import { EmploymentTypes } from '../../components/misc/SelectOptions';
import { TfiLocationPin } from 'react-icons/tfi';
import { FaSuitcase } from 'react-icons/fa';

export default function CareerPlanPage() {
  const ctx = useContext(UserContext);
  const user = ctx?.user ?? null;
  const [formData, setFormData] = useState({ employmentType: 'INTERN', location: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [jobListings, setJobListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { employmentType, location } = formData;

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value } as any);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const requestQuery = searchQuery + ' in ' + location;
      const res = await api.post('/getJobListings', {
        queryParams: {
          query: requestQuery,
          date_posted: 'month',
          num_pages: 5,
          radius: 50,
          employment_types: employmentType,
        }
      });
      setJobListings(res.data?.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value);

  useEffect(() => {
    if (user?.degree) setSearchQuery(user.degree.major ?? '');
  }, [user]);

  return (
    <div className="study-plan-container bg-theme1 shadow-md rounded py-8 flex flex-col w-2/3 mx-auto items-center">
      <h2 className='text-5xl font-bold p-5 text-center'>Career Planner</h2>
      <p>Find jobs and internships</p>
      <p className=" mb-10">Gain experience before graduating</p>

      <form onSubmit={onSubmit} className='flex items-center w-2/3 space-x-4'>
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 flex items-center ps-3 pointer-events-none">
            <IoIosSearch size={20} />
          </div>
          <input value={searchQuery} onChange={handleSearch} type="search" id="default-search" placeholder="Search jobs..." className="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50" />
        </div>

        <div className="form-group mb-7 mr-4">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Employment Type</label>
          <div className="flex space-x-1">
            <FaSuitcase size={30} />
            <select value={employmentType} name='employmentType' onChange={onChange} className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full">
              <EmploymentTypes />
            </select>
          </div>
        </div>

        <div className="form-group mb-7">
          <label className='block text-gray-700 text-sm font-bold mb-2'>Job Location</label>
          <div className="flex">
            <TfiLocationPin size={30} />
            <input type="text" name="location" value={location} onChange={onChange} required className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline w-full" />
          </div>
        </div>

        <button type="submit" className='text-lg bg-theme3 shadow-sm text-white py-2 px-4 rounded-full text-center'>Search</button>
      </form>

      {isLoading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : (
        <div className="jobs-container flex flex-wrap w-2/3 self-center overflow-y-scroll h-screen">
          {jobListings.map((jobListing: any, idx: number) => (
            <div key={idx} className="m-2 py-2 px-4 flex flex-col bg-theme2 items-center rounded shadow-md h-64 w-64">
              <h1 className="text-lg font-bold">{(jobListing.job_job_title ?? jobListing.job_title) ? ((jobListing.job_job_title ?? jobListing.job_title).length < 30 ? (jobListing.job_job_title ?? jobListing.job_title) : (jobListing.job_job_title ?? jobListing.job_title).slice(0, 30) + '...') : 'Job'}</h1>
              <img src={jobListing.employer_logo} alt='Company logo' className="max-h-40 max-w-40 my-2" />
              <p>{jobListing.employer_name}</p>
              <p>{jobListing.job_city}, {jobListing.job_country}</p>
              <p>Rating: {jobListing.job_apply_quality_score ? (jobListing.job_apply_quality_score * 5).toFixed(2) : 'N/A'}</p>
              <p>Posted {jobListing.job_posted_at_timestamp ? new Date(jobListing.job_posted_at_timestamp * 1000).toLocaleDateString() : ''}</p>
              <a href={jobListing.job_apply_link} target="_blank" rel="noreferrer" className="hover:underline font-bold text-theme4 mt-auto ">Apply</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}