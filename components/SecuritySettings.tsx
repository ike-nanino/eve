"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SecuritySettings() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change Password</h2>
        <Input type="password" placeholder="Old Password" />
        <Input type="password" placeholder="New Password" />
        <Input type="password" placeholder="Confirm Password" />
        <Button>Change Password</Button>
      </Card>
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Change PIN</h2>
        <Input type="password" placeholder="Current Pin" />
        <Input type="password" placeholder="New Pin" />
        <Input type="password" placeholder="Confirm Pin" />
        <Button>Change Pin</Button>
      </Card>
    </div>
  );
}