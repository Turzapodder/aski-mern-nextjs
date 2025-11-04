"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  BookOpen,
  Eye,
  Filter,
  Search,
  Send
} from "lucide-react";
import { useGetAssignmentsQuery } from "@/lib/services/assignments";
import { useGetUserQuery } from "@/lib/services/auth";
import SendProposalModal from "@/components/SendProposalModal";

interface Assignment {
  _id: string;
  title: string;
  description: string;
  subject: string;
  topics: string[];
  deadline: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  createdAt: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
}

const AllAssignmentsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Get current user data
  const { data: userData } = useGetUserQuery();
  const currentUser = userData?.user;
  const userRole = currentUser?.roles?.[0];

  // Use RTK Query to fetch assignments
  const { 
    data: assignmentsData, 
    isLoading: loading, 
    error,
    refetch 
  } = useGetAssignmentsQuery({
    page: 1,
    limit: 50,
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
    search: searchTerm || undefined
  });

  const assignments = assignmentsData?.data || [];
  
  // Use assignments directly since API already handles filtering
  const filteredAssignments = assignments;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/user/assignments/${assignmentId}`);
  };

  const handleSendProposal = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setIsProposalModalOpen(true);
  };

  const handleProposalModalClose = () => {
    setIsProposalModalOpen(false);
    setSelectedAssignment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-300 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {error && 'data' in error ? 
              (error.data as any)?.message || 'Failed to load assignments' : 
              'Failed to load assignments'
            }
          </p>
          <button 
            onClick={() => refetch()}
            className="bg-primary-300 text-white px-4 py-2 rounded-lg hover:bg-primary-400 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log(assignmentsData);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Assignments</h1>
          <p className="text-gray-600">Manage and view all assignment requests</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              >
                <option value="all">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-lg p-12 shadow-sm text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all" 
                  ? "Try adjusting your filters to see more results."
                  : "There are no assignments available at the moment."
                }
              </p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title and Subject */}
                    <div className="mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {assignment.subject}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(assignment.status)}`}>
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {assignment.description}
                    </p>

                    {/* Topics */}
                    {assignment.topics && assignment.topics.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {assignment.topics.slice(0, 3).map((topic, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {topic}
                            </span>
                          ))}
                          {assignment.topics.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              +{assignment.topics.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Assignment Info */}
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {formatDate(assignment.deadline)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Posted: {formatDate(assignment.createdAt)}</span>
                      </div>
                      {assignment.estimatedCost > 0 && (
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${assignment.estimatedCost}</span>
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Student:</span> {assignment.student.name} ({assignment.student.email})
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex-shrink-0 space-y-2">
                    <button
                      onClick={() => handleViewDetails(assignment._id)}
                      className="w-full inline-flex items-center px-4 py-2 bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    
                    {/* Show Send Proposal button only for tutors */}
                    {userRole === 'tutor' && assignment.status === 'open' && (
                      <button
                        onClick={() => handleSendProposal(assignment)}
                        className="w-full inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Send Proposal</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send Proposal Modal */}
      {selectedAssignment && (
        <SendProposalModal
          isOpen={isProposalModalOpen}
          onClose={handleProposalModalClose}
          assignment={selectedAssignment}
        />
      )}
    </div>
  );
};

export default AllAssignmentsPage;