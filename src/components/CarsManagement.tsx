import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface User {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
}

const fetchUsers = async (): Promise<User[]> => {
  const { data } = await axios.get<User[]>('https://676d28d40e299dd2ddfea145.mockapi.io/users');
  return data;
};

const UsersManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const addCarMutation = useMutation({
    mutationFn: (newCar: Omit<User, 'id'>) =>
      axios.post<User>('https://676d28d40e299dd2ddfea145.mockapi.io/users', newCar).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateCarMutation = useMutation({
    mutationFn: ({ id, name, price, description, image }: User) =>
      axios.put<User>(`https://676d28d40e299dd2ddfea145.mockapi.io/users/${id}`, { name, price, description, image }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteCarMutation = useMutation({
    mutationFn: (carId: string) =>
      axios.delete(`https://676d28d40e299dd2ddfea145.mockapi.io/users/${carId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCar, setCurrentCar] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [image, setUrl] = useState('');

  const openModal = (user?: User) => {
    setIsModalOpen(true);
    if (user) {
      setIsEditing(true);
      setCurrentCar(user);
      setName(user.name);
      setPrice(user.price);
      setDescription(user.description);
      setUrl(user.image);
      toast.info('Edit the form to update the user!');
    } else {
      setIsEditing(false);
      setCurrentCar(null);
      setName('');
      setPrice(0);
      setDescription('');
      setUrl('');
      toast.info('Fill in the form to add a new user!');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setName('');
    setPrice(0);
    setDescription('');
    setUrl('');
    setCurrentCar(null);
  };

  const openDeleteModal = (car: User) => {
    setIsDeleteModalOpen(true);
    setCurrentCar(car);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentCar(null);
  };

  const handleSave = () => {
    if (isEditing && currentCar) {
      updateCarMutation.mutate({ id: currentCar.id, name, price, description, image });
    } else {
      addCarMutation.mutate({ name, price, description, image });
    }
    closeModal();
    toast.success('User saved successfully!');
  };

  const handleDelete = () => {
    if (currentCar) {
      deleteCarMutation.mutate(currentCar.id);
    }
    closeDeleteModal();
    toast.success('User deleted successfully!');
  };


  return (
    <div className="p-6 max-w-full] mx-auto">
      <Toaster />
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
            className="bg-slate-400 p-4 rounded-xl shadow w-[400px] text-center"
          >
            <div>
              <h3 className="font-bold text-[30px] mb-[20px]">{user.name}</h3>
              <img src={user.image} alt='Car' className="w-[300px] h-[300px] object-cover mx-auto rounded-lg" />
              <p className='text-[20px] mt-[10px]'>Monthly salary: <span className='text-white'>${user.price}</span></p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => openModal(user)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-white hover:text-black duration-300 "
              >
                Edit
              </button>
              <button
                onClick={() => openDeleteModal(user)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-white hover:text-black duration-300"
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
            className="bg-white p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">
              {isEditing ? 'Edit Car' : 'Add Car'}
            </h3>
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
            <input
              type="text" // type="image" o'rniga
              value={image}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Image URL"
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
                className="px-4 py-2 bg-black text-white rounded "
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
            className="bg-white p-6 rounded shadow-lg w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Delete Car</h3>
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
                className="px-4 py-2 bg-black text-white rounded"
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

export default UsersManagement;
