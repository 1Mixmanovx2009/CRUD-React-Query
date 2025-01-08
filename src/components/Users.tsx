import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  price: number;
  image: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await axios.get<User[]>('https://676d28d40e299dd2ddfea145.mockapi.io/users');
  return data;
};

const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const addUserMutation = useMutation({
    mutationFn: (newUser: Omit<User, 'id'>) =>
      axios.post<User>('https://676d28d40e299dd2ddfea145.mockapi.io/users', newUser).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, name, price, image }: User) =>
      axios.put<User>(`https://676d28d40e299dd2ddfea145.mockapi.io/users/${id}`, { name, price,  image }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) =>
      axios.delete(`https://676d28d40e299dd2ddfea145.mockapi.io/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [image, setUrl] = useState('');

  const openModal = (user?: User) => {
    setIsModalOpen(true);
    if (user) {
      setIsEditing(true);
      setCurrentUser(user);
      setName(user.name);
      setPrice(user.price);
      setUrl(user.image);
    } else {
      setIsEditing(false);
      setCurrentUser(null);
      setName('');
      setPrice(0);
      setUrl('');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName('');
    setPrice(0);
    setUrl('');
    setCurrentUser(null);
  };

  const openDeleteModal = (User: User) => {
    setIsDeleteModalOpen(true);
    setCurrentUser(User);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentUser(null);
  };

  const handleSave = () => {
    if (isEditing && currentUser) {
      updateUserMutation.mutate({ id: currentUser.id, name, price, image });
    } else {
      addUserMutation.mutate({ name, price,  image });
    }
    closeModal();
  };

  const handleDelete = () => {
    if (currentUser) {
      deleteUserMutation.mutate(currentUser.id);
    }
    closeDeleteModal();
  };


  return (
    <div className="p-6 max-w-full bg-gray-600 mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Users</h2>
      <button
        onClick={() => openModal()}
        className="mb-5 mx-[45%] w-[200px] px-4 py-2 bg-black text-white rounded-[30px] text-center hover:bg-white hover:text-black duration-300"
      >
        Add new user
      </button>
      <ul className="flex items-start justify-center flex-wrap gap-5 ">
        {users?.map((user: User) => (
          <li
            key={user.id}
            className="bg-slate-500 p-4 rounded-xl shadow w-[400px] text-center"
          >
            <div>
              <img src={user.image} alt='User' className="w-[300px] h-[300px] object-cover mx-auto rounded-lg" />
              <h3 className="font-bold text-[30px] mb-[20px]">{user.name}</h3>
              <p className='text-[20px] mt-[10px]'>Monthly salary: <span className='text-white'>${user.price}</span></p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => openModal(user)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-white hover:text-green-500 duration-300 "
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(user)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-white hover:text-red-500 duration-300"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-slate-500 p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? 'Edit User' : 'Add User'}
            </h3>
            <input
              type="text"
              value={image}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Image URL"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <input
              required
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="monthly salary"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            

            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded "
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-slate-500 p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Delete User</h3>
            <p>Do you want to delete the user?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
