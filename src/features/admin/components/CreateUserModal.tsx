import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ApiUserRole } from '../../auth/constants/userRole';
import { userService } from '../services/userService';
import type { CreateUserRequest } from '../types/user.types';
import { Modal, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const ROLE_OPTIONS = [
  { value: ApiUserRole.FINANCE_ASSOCIATE, label: 'Finance Associate' },
  { value: ApiUserRole.FINANCE_MANAGER, label: 'Finance Manager' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    email: '',
    password: '',
    role: ApiUserRole.FINANCE_ASSOCIATE,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleClose = () => {
    onClose();
    setFormData({
      name: '',
      email: '',
      password: '',
      role: ApiUserRole.FINANCE_ASSOCIATE,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await userService.createUser(formData);
      toast.success('User onboarded successfully');
      onUserCreated();
      handleClose();
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: string | Array<{ msg: string }> }; status?: number };
      };
      const detail = axiosError.response?.data?.detail;
      let errorMessage = 'Failed to create user';

      if (typeof detail === 'string') {
        errorMessage = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        errorMessage = detail[0].msg;
      } else if (axiosError.response?.status === 500) {
        errorMessage = 'Internal server error. Please try again.';
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title="Onboard New User"
      description="Create an account for a finance associate or manager."
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Initial Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Select
          label="Role"
          options={ROLE_OPTIONS}
          value={formData.role}
          onValueChange={(value) => setFormData({ ...formData, role: value })}
        />

        <ModalFooter className="mt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create User
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
