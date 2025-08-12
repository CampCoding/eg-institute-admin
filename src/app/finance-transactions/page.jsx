"use client";
import React, { useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { 
  Plus, Search, Filter, ArrowUpCircle, ArrowDownCircle, DollarSign, 
  Calendar, TrendingUp, Download, Eye, Edit, Trash2, MoreHorizontal,
  ChevronDown, FileText, CreditCard, Banknote
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip } from "antd";
import { finance_transactions } from "@/utils/data";
import DeleteModal from "@/components/DeleteModal/DeleteModal";

export default function FinanceTransactionsPage() {
  const [transactions, setTransactions] = useState(finance_transactions);
  const [openDeleteModal , setOpenDeleteModal] = useState(false);
  const [rowData , setRowData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or cards
  const router = useRouter();
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tx.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalIncome = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;
  const pendingAmount = transactions.filter(t => t.status === "pending").reduce((sum, t) => sum + t.amount, 0);

  const getStatusColor = (status) => {
    switch(status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "paid": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch(method.toLowerCase()) {
      case "credit card": return <CreditCard size={16} className="text-blue-500" />;
      case "cash": return <Banknote size={16} className="text-green-500" />;
      case "bank transfer": return <DollarSign size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  const handleDeleteTransaction = (txId) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setTransactions(transactions.filter(tx => tx.id !== txId));
    }
  };

  function handleSubmit() {
    console.log("Delete transaction")
  }

  return (
    <div className="min-h-screen">
      <div className="">
        <BreadCrumb title={"Finance Transactions"} parent={"Finance"} child={"Transactions"} />

        {/* Header Section */}
        <div className="mt-8 mb-8">
          <div className="flex w-fit ms-auto flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Export Report")}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <button
                onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {viewMode === "table" ? "Card View" : "Table View"}
              </button>
              <button
                onClick={() => router.push(`/finance-transactions`)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyab-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Add Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Income</p>
                <p className="text-3xl font-bold text-green-600 mt-1">${totalIncome.toLocaleString()}</p>
                <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <ArrowUpCircle size={28} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600 mt-1">${totalExpenses.toLocaleString()}</p>
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <TrendingUp size={12} className="rotate-180" />
                  +8.2% from last month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-red-100 to-red-200 rounded-xl flex items-center justify-center">
                <ArrowDownCircle size={28} className="text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Net Balance</p>
                <p className={`text-3xl font-bold mt-1 ${netBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  ${netBalance.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">Current month</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <DollarSign size={28} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending Amount</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">${pendingAmount.toLocaleString()}</p>
                <p className="text-xs text-amber-500 mt-1">{transactions.filter(t => t.status === "pending").length} transactions</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                <Calendar size={28} className="text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search transactions, categories, or references..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none appearance-none min-w-[120px]"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>

              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white outline-none appearance-none min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Display */}
        {viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(tx.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-500">{tx.reference}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tx.category}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          tx.type === "income" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {tx.type === "income" ? <ArrowUpCircle size={12} /> : <ArrowDownCircle size={12} />}
                          {tx.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-sm font-bold ${
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        ${tx.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getPaymentMethodIcon(tx.paymentMethod)}
                          {tx.paymentMethod}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye size={16} />
                          </button> */}
                          <Tooltip 
                          onClick= { () => router.push(`/finance-transactions/edit-finance/${tx?.id}`)}

                          title="Edit" className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                            <Edit size={26} />
                          </Tooltip>
                          <Tooltip title="Delete" 
                            onClick={() => {
                              setRowData(tx)
                              setOpenDeleteModal(true)
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={26} />
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "Add your first transaction to get started."
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Card View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      tx.type === "income" ? "bg-green-100" : "bg-red-100"
                    }`}>
                      {tx.type === "income" ? 
                        <ArrowUpCircle className="text-green-600" size={24} /> : 
                        <ArrowDownCircle className="text-red-600" size={24} />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{tx.description}</h3>
                      <p className="text-xs text-gray-500">{tx.reference}</p>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                    <MoreHorizontal size={16} className="text-gray-400" />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className={`font-bold ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      ${tx.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="text-gray-900">{tx.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date</span>
                    <span className="text-gray-900">{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Payment</span>
                    <div className="flex items-center gap-1">
                      {getPaymentMethodIcon(tx.paymentMethod)}
                      <span className="text-gray-900">{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tx.status)}`}>
                    {tx.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all">
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTransaction(tx.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteModal open={openDeleteModal} handleSubmit={handleSubmit} setOpen={setOpenDeleteModal} title={"Delete this transaction"} description={"Do you want to delete this transaction?"}/>
    </div>
  );
}