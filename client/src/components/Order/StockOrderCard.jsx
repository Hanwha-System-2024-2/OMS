import React, { useState, useEffect } from "react";

const StockOrderCard = ({
  type,
  labels,
  onCancel,
  onSubmit,
  defaultValues,
}) => {
  // 수량과 가격 상태 관리
  const [quantity, setQuantity] = useState(defaultValues?.quantity || 0);
  const [price] = useState(defaultValues?.price || 0); // 가격은 고정값으로 가정

  // 총 금액 계산
  const total = quantity * price;

  // defaultValues.quantity가 변경될 때 quantity를 동기화
  useEffect(() => {
    setQuantity(defaultValues?.quantity || 0);
  }, [defaultValues?.quantity]);

  // 동적으로 제목, 버튼 텍스트, 색상 설정 => type에 따라 받아올 수 있도록 함
  const title = labels.title || `${type} 주문`;
  const buttonText = labels.buttonText || `${type} (Enter)`;
  const buttonColor = labels.buttonColor || "bg-blue-500 hover:bg-blue-600";
  const titleColor = labels.titleColor || "text-blue-500";

  return (
    <div>
      <h2 className={`text-xl font-bold ${titleColor} mb-6 text-center`}>
        {title}
      </h2>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(e, quantity); // quantity 전달
        }}
      >
        {/* 수량 */}
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">
            {labels.quantityLabel || "주문 수량"}
          </label>
          <input
            type="number"
            className="border rounded-md p-2 w-32 text-center text-gray-700"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
          <span className="ml-2 text-gray-700">
            {labels.quantityUnit || "주"}
          </span>
        </div>

        {/* 단가 */}
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">
            {labels.priceLabel || "주문 단가"}
          </label>
          <p className="text-gray-900 font-semibold">
            {price.toLocaleString()} <span className="text-gray-500">원</span>
          </p>
        </div>

        {/* 총 금액 */}
        <div className="flex items-center justify-between">
          <label className="text-gray-700 font-medium">
            {labels.totalLabel || "총 주문 금액"}
          </label>
          <p className="text-gray-900 font-semibold">
            {total.toLocaleString()} <span className="text-gray-500">원</span>
          </p>
        </div>

        {/* 버튼 섹션 */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            className="bg-gray-200 text-gray-700 rounded-lg px-6 py-3 font-medium shadow-md hover:bg-gray-300"
            onClick={onCancel}
          >
            {labels.cancelButton || "취소"}
          </button>
          <button
            type="submit"
            className={`${buttonColor} text-white rounded-lg px-6 py-3 font-medium shadow-md`}
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockOrderCard;
