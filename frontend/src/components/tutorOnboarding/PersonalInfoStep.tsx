import { type FormikProps } from 'formik';
import { countries } from 'countries-list';
import MultiSelect from '@/components/MultiSelect';
import { subjectTopics } from '@/constants/subjectTopics';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import { CertificateUpload } from './CertificateUpload';
import type { OnboardingFormData } from './types';

const countryList = Object.values(countries)
  .map((c) => (c as { name: string }).name)
  .sort();

const getSubjectTopics = (subject: string): string[] => {
  const topics = subjectTopics as Record<string, string[]>;
  return topics[subject] || [];
};

interface PersonalInfoStepProps {
  formik: FormikProps<OnboardingFormData>;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
}

export function PersonalInfoStep({ formik, errorMessage, setErrorMessage }: PersonalInfoStepProps) {
  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: text fields */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full name*</label>
            <input
              type="text"
              name="name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email*</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number*</label>
            <input
              type="text"
              name="phoneNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.phoneNumber}</div>
            )}
          </div>
        </div>

        {/* Right: profile picture */}
        <div className="md:col-span-1">
          <ProfilePictureUpload
            name={formik.values.name}
            profilePicture={formik.values.profilePicture}
            onFileChange={(file) => formik.setFieldValue('profilePicture', file)}
          />
        </div>
      </div>

      {/* University */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          University or School Name*
        </label>
        <input
          type="text"
          name="university"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.university}
          className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {formik.touched.university && formik.errors.university && (
          <div className="text-red-500 text-sm mt-1">{formik.errors.university}</div>
        )}
      </div>

      {/* Degree & GPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Degree/Class*
          </label>
          <input
            type="text"
            name="degree"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.degree}
            className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {formik.touched.degree && formik.errors.degree && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.degree}</div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current GPA/Result*
          </label>
          <input
            type="text"
            name="gpa"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.gpa}
            className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          {formik.touched.gpa && formik.errors.gpa && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.gpa}</div>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country*</label>
        <select
          name="country"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.country}
          className="w-full px-4 py-2 border border-gray-300 rounded-[15px] focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
        >
          <option value="">Select a country</option>
          {countryList.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {formik.touched.country && formik.errors.country && (
          <div className="text-red-500 text-sm mt-1">{formik.errors.country}</div>
        )}
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">Choose Subject*</label>
        <select
          name="subject"
          value={formik.values.subject}
          onChange={(e) => {
            formik.setFieldValue('subject', e.target.value);
            formik.setFieldValue('topics', []);
            setErrorMessage('');
          }}
          onBlur={formik.handleBlur}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-600 focus:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-300"
        >
          <option value="">Select a subject</option>
          {Object.keys(subjectTopics).map((subject) => (
            <option key={subject} value={subject}>
              {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </option>
          ))}
        </select>
        {formik.touched.subject && formik.errors.subject && (
          <div className="text-red-500 text-sm mt-1">{formik.errors.subject}</div>
        )}
      </div>

      {/* Topics */}
      {formik.values.subject && (
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2 mt-5">
            Select Topics*
          </label>
          <MultiSelect
            options={getSubjectTopics(formik.values.subject)}
            placeholder="Choose topics"
            onChange={(selected) => formik.setFieldValue('topics', selected)}
          />
          {formik.touched.topics && formik.errors.topics && (
            <div className="text-red-500 text-sm mt-1">{String(formik.errors.topics)}</div>
          )}
        </div>
      )}

      {/* Certificate */}
      <CertificateUpload
        certificate={formik.values.certificate}
        onFileChange={(file) => formik.setFieldValue('certificate', file)}
        onRemove={() => formik.setFieldValue('certificate', null)}
      />
    </div>
  );
}
