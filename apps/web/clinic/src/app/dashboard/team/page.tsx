'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../../store/hooks';
import ApiManager from '../../../services/api';
import AddTeamMemberModal from '../../../components/molecule/AddTeamMemberModal';
import { 
  UserPlus,
  Users,
  Stethoscope,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Grid,
  List,
  Edit,
  Trash2,
  Clock,
  Award,
  MapPin
} from 'lucide-react';

interface TeamMember {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: 'physiotherapist' | 'receptionist';
  is_admin: boolean;
  clinic_id: string;
  clinic_name: string;
  is_profile_complete: boolean;
  profile_completed_at?: Date;
  created_at: string;
  user_status: string;
}

interface TeamData {
  members: TeamMember[];
  total_count: number;
  physiotherapists_count: number;
  receptionists_count: number;
}

export default function TeamPage() {
  const { userData, currentClinic } = useAppSelector(state => state.user);
  const [teamData, setTeamData] = useState<TeamData>({
    members: [],
    total_count: 0,
    physiotherapists_count: 0,
    receptionists_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [roleFilter, setRoleFilter] = useState<'all' | 'physiotherapist' | 'receptionist'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, [currentClinic]);

  const fetchTeamMembers = async () => {
    if (!userData?.organization?.id) return;
    
    try {
      setLoading(true);
      const response = await ApiManager.getTeamMembers(
        userData.organization.id,
        currentClinic?.id
      );
      if (response.success) {
        setTeamData(response.data || {
          members: [],
          total_count: 0,
          physiotherapists_count: 0,
          receptionists_count: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = teamData.members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.clinic_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleAddTeamMember = () => {
    setShowAddModal(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'physiotherapist':
        return <Stethoscope className="h-4 w-4" />;
      case 'receptionist':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'physiotherapist':
        return 'bg-blue-100 text-blue-800';
      case 'receptionist':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!userData?.organization?.is_owner && !currentClinic?.is_admin) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only organization administrators and clinic administrators can manage team members.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            {currentClinic 
              ? `Manage ${currentClinic.name} team members`
              : 'Manage all organization team members'
            }
          </p>
        </div>
        <button
          onClick={handleAddTeamMember}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="physiotherapist">Physiotherapists</option>
              <option value="receptionist">Receptionists</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-semibold text-gray-900">{teamData.total_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Physiotherapists</p>
              <p className="text-2xl font-semibold text-gray-900">{teamData.physiotherapists_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Receptionists</p>
              <p className="text-2xl font-semibold text-gray-900">{teamData.receptionists_count}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Complete Profiles</p>
              <p className="text-2xl font-semibold text-gray-900">
                {teamData.members.filter(m => m.is_profile_complete).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members List/Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || roleFilter !== 'all' ? 'No team members found' : 'No team members yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || roleFilter !== 'all'
              ? 'Try adjusting your search terms or filters' 
              : 'Get started by adding your first team member'
            }
          </p>
          {!searchTerm && roleFilter === 'all' && (
            <button
              onClick={handleAddTeamMember}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Your First Team Member
            </button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredMembers.map((member) => (
            <TeamMemberCard key={`${member.id}-${member.clinic_id}`} member={member} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <AddTeamMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTeamMembers();
          }}
        />
      )}
    </div>
  );
}

interface TeamMemberCardProps {
  member: TeamMember;
  viewMode: 'grid' | 'list';
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, viewMode }) => {
  const [showMenu, setShowMenu] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {member.full_name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="text-lg font-medium text-gray-900 truncate">{member.full_name}</h3>
                {member.is_admin && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                  {getRoleIcon(member.role)}
                  <span className="ml-1 capitalize">{member.role}</span>
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {member.phone}
                </span>
                <span className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {member.email}
                </span>
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {member.clinic_name}
                </span>
                <span className="flex items-center">
                  {member.is_profile_complete ? (
                    <><CheckCircle className="h-4 w-4 mr-1 text-green-500" /> Complete</>
                  ) : (
                    <><Clock className="h-4 w-4 mr-1 text-orange-500" /> Pending</>
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Member
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
            {member.full_name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex items-center space-x-2">
            {member.is_admin && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                Admin
              </span>
            )}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
              {getRoleIcon(member.role)}
              <span className="ml-1 capitalize">{member.role}</span>
            </span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.full_name}</h3>
          <p className="text-sm text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {member.clinic_name}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{member.email}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center text-sm">
            {member.is_profile_complete ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                <span className="text-green-600">Profile Complete</span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-1 text-orange-500" />
                <span className="text-orange-600">Profile Pending</span>
              </>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 bottom-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2">
                  <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Member
                  </button>
                  <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Member
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function getRoleIcon(role: string) {
    switch (role.toLowerCase()) {
      case 'physiotherapist':
        return <Stethoscope className="h-3 w-3" />;
      case 'receptionist':
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  }

  function getRoleColor(role: string) {
    switch (role.toLowerCase()) {
      case 'physiotherapist':
        return 'bg-blue-100 text-blue-800';
      case 'receptionist':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
};