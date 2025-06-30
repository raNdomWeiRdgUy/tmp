'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/lib/store';
import { Edit2, Save, X, Shield, Mail, Phone, Calendar, Package, MapPin, Heart } from 'lucide-react';

export default function AccountPage() {
  const { state } = useApp();
  const user = state.user!;

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone || '',
  });

  const handleSave = () => {
    // In a real app, you'd save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.firstName} {user.lastName}</h3>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified Account
                </Badge>
                {user.isAdmin && (
                  <Badge className="bg-purple-100 text-purple-800">
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                {isEditing ? (
                  <Input
                    id="firstName"
                    value={editedUser.firstName}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{user.firstName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="lastName"
                    value={editedUser.lastName}
                    onChange={(e) => setEditedUser(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{user.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, email: e.target.value }))}
                      className="flex-1"
                    />
                  ) : (
                    <span className="text-gray-900">{user.email}</span>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={editedUser.phone}
                      onChange={(e) => setEditedUser(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                      className="flex-1"
                    />
                  ) : (
                    <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Member since {new Date(user.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Account Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {user.orders.length}
            </div>
            <p className="text-gray-600">Total Orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {user.wishlist.length}
            </div>
            <p className="text-gray-600">Wishlist Items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {user.addresses.length}
            </div>
            <p className="text-gray-600">Saved Addresses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Account created</p>
                <p className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline">Account</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div>
                <p className="font-medium">Email verified</p>
                <p className="text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Security
              </Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Last login</p>
                <p className="text-sm text-gray-600">Today</p>
              </div>
              <Badge variant="outline">Login</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">View Orders</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <MapPin className="h-6 w-6" />
              <span className="text-sm">Manage Addresses</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Heart className="h-6 w-6" />
              <span className="text-sm">View Wishlist</span>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="text-sm">Security Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
