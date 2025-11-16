"use client";
import BusinessManagement from "@/components/Admin/BusinessManagement";
import BusinessCustomer from "@/components/Admin/BusinessCustomer";

export default function BusinessCustomerPage() {
  return (
    <BusinessManagement>
      <BusinessCustomer />
    </BusinessManagement>
  );
}

