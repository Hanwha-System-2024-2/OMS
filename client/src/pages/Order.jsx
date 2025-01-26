import { useState, useContext } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
// import { UserAuthContext } from "../../App";
import api from "../utils/api";

// import StockChart from "./stockChart/StockChart";
// import StockInformationTabs from "./stockInformationTabs/StockInformationTabs";
// import FavoriteItemsCarousel from "../main/favoriteStocks/FavoriteItemsCarousel";
import CustomCircularProgress from "../components/CustomCircularProgress";
import NotFound from "../components/NotFound";
import StockOrderCard from "../components/Order/StockOrderCard";
// import { StockDetailsTitle } from "./stockItemTitle/StockDetailsTitle";
import { Helmet } from "react-helmet";
import Title from "../components/Title";
import { Card } from "@mui/material";

/** 주식 상세정보 화면 */
const Order = () => {
  const navigate = useNavigate();
  const { stockId } = useParams();

  const [activeTab, setActiveTab] = useState("sell");
  // 매도와 매수 각각의 상태 관리
  const [sellQuantity, setSellQuantity] = useState(0);
  const [buyQuantity, setBuyQuantity] = useState(0);

  const orderTypes = {
    sell: {
      labels: {
        title: "매도 주문",
        buttonText: "매도 (Enter)",
        buttonColor: "bg-blue-500 hover:bg-blue-600",
        titleColor: "text-blue-500",
        quantityLabel: "매도 수량",
        priceLabel: "매도 단가",
        totalLabel: "총 매도 금액",
        cancelButton: "매도 취소",
      },
      defaultValues: {
        quantity: sellQuantity,
        price: 96400,
      },
    },
    buy: {
      labels: {
        title: "매수 주문",
        buttonText: "매수 (Enter)",
        buttonColor: "bg-red-500 hover:bg-red-600",
        titleColor: "text-red-500",
        quantityLabel: "매수 수량",
        priceLabel: "매수 단가",
        totalLabel: "총 매수 금액",
        cancelButton: "매수 취소",
      },
      defaultValues: {
        quantity: buyQuantity,
        price: 104000,
      },
    },

    // modify: {
    //   labels: {
    //     title: "정정 주문",
    //     buttonText: "정정 (Enter)",
    //     buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    //     titleColor: "text-yellow-500",
    //     quantityLabel: "정정 수량",
    //     priceLabel: "정정 단가",
    //     totalLabel: "총 정정 금액",
    //     cancelButton: "정정 취소",
    //   },
    //   defaultValues: {
    //     quantity: 5, // 정정은 잘 모르겠네여..
    //     price: 88000,
    //   },
    // },
  };

  const handleCancel = () => {
    console.log("주문이 취소되었습니다.");
  };

  const handleSubmit = (e, quantity) => {
    e.preventDefault();
    console.log(`${activeTab} 주문 제출: 수량 - ${quantity}`);
  };

  // const userAuthContext = useContext(UserAuthContext);
  // const accessToken = userAuthContext?.accessToken;

  // const { isLoading, data, error } = useQuery(
  //   ["stock-details", stockId],
  //   async () => {
  //     const response = await api.get(`/stock/${stockId}`, {
  //       // headers: { accesstoken: accessToken },
  //     });
  //     return response?.data;
  //   },
  //   { refetchInterval: 3000 }
  // );

  // if (isLoading) return <CustomCircularProgress />;

  if (typeof stockId === "undefined") return <NotFound />;

  // if (
  //   error ||
  //   data?.error?.code === "MYSQL_NO_DATA" ||
  //   data?.error?.message === "994"
  // ) {
  //   alert("올바른 종목 코드로 조회해주시기 바랍니다.");
  //   navigate("/stock");
  //   return <NotFound />;
  // }

  // const stockItem = data?.data;

  return (
    <div className="h-full grid grid-cols-12 gap-6 p-6">
      {/* 좌측 주문 정보 */}
      <div className="col-span-7 bg-white shadow-lg rounded-lg p-6">
        <div>
          {/* 검색 필드 */}
          <div className="mb-6 flex items-center gap-4">
            <input
              type="text"
              className="border rounded-lg p-3 w-full text-gray-700"
              placeholder="종목명 검색"
            />
            <button className="bg-blue-500 text-white rounded-lg w-full py-3 font-medium shadow-md hover:bg-blue-600 flex justify-center items-center">
              검색
            </button>
          </div>

          {/* 테이블 */}
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-4">현재가</th>
                <th className="p-4">전일대비</th>
                <th className="p-4">등락률</th>
                <th className="p-4">거래량</th>
                <th className="p-4">전일거래량</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-700 text-sm">
                <td className="p-4 text-red-500 font-semibold">3,785</td>
                <td className="p-4 text-red-500 font-semibold">75</td>
                <td className="p-4 text-red-500 font-semibold">2.02%</td>
                <td className="p-4">1,848,827</td>
                <td className="p-4">1,172,703</td>
              </tr>
            </tbody>
          </table>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm">
                <th className="p-4">매도증감</th>
                <th className="p-4">매도잔량</th>
                <th className="p-4">현재시간</th>
                <th className="p-4">매수잔량</th>
                <th className="p-4">매수증감</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-700 text-sm">
                <td className="p-4">3,032</td>
                <td className="p-4">-100</td>
                <td className="p-4">3,410</td>
              </tr>
              <tr className="text-gray-700 text-sm">
                <td className="p-4"></td>
                <td className="p-4"></td>
                <td className="p-4">2,976</td>
                <td className="p-4">0</td>
                <td className="p-4">4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 우측 주문 폼 */}
      <div className="col-span-5 bg-gray-50 shadow-lg rounded-lg p-6 flex flex-col">
        {/* 탭 메뉴 */}
        <div className="col-span-12">
          <div className="flex border-b border-gray-300 mb-6">
            {Object.keys(orderTypes).map((type) => (
              <button
                key={type}
                className={`py-3 text-lg font-medium ${
                  activeTab === type
                    ? "text-blue-500 border-b-4 border-blue-500"
                    : "text-gray-400"
                }`}
                onClick={() => setActiveTab(type)}
              >
                {orderTypes[type].labels.title}
              </button>
            ))}
          </div>
        </div>

        {/* 탭별 콘텐츠 */}
        <div className="col-span-12 bg-gray-50 shadow-lg rounded-lg p-6">
          <StockOrderCard
            type={activeTab}
            labels={orderTypes[activeTab].labels}
            defaultValues={orderTypes[activeTab].defaultValues}
            onCancel={handleCancel}
            onSubmit={(e, quantity) => {
              handleSubmit(e, quantity);
              // 탭별로 상태 업데이트
              if (activeTab === "sell") setSellQuantity(quantity);
              else if (activeTab === "buy") setBuyQuantity(quantity);
            }}
          />
        </div>
      </div>
      {/* 주문체결 조회 섹션 */}
      <div className="col-span-12 bg-white shadow-lg rounded-lg p-6 mt-6">
        {/* 탭 메뉴 */}
        <div className="flex border-b border-gray-300 mb-4">
          <button className="text-blue-500 font-medium px-6 py-3 border-b-2 border-blue-500 focus:outline-none">
            주문체결
          </button>
        </div>

        {/* 계좌 및 조회 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <select
              className="border rounded-lg p-2 w-64 text-gray-700"
              defaultValue="계좌번호 선택"
            >
              <option value="계좌번호 선택" disabled>
                계좌번호 선택
              </option>
              <option value="계좌1">501-123456-45 연금저축</option>
            </select>
            <input
              type="text"
              className="border bg-gray-300 rounded-lg p-2 w-16 text-gray-700"
              placeholder="김지나"
            />
          </div>
          <button className="bg-blue-500 text-white rounded-lg px-6 py-3 font-medium shadow-md hover:bg-blue-600">
            조회
          </button>
        </div>

        {/* 테이블 */}
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="p-4">주문번호</th>
              <th className="p-4">종목명</th>
              <th className="p-4">주문수량</th>
              <th className="p-4">체결수량</th>
              <th className="p-4">취소구분</th>
              <th className="p-4">주문구분</th>
              <th className="p-4">주문단가</th>
              <th className="p-4">체결가격</th>
              <th className="p-4">체결조건</th>
              <th className="p-4">거부사유</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-gray-700 text-sm">
              <td className="p-4">123456</td>
              <td className="p-4">삼성전자</td>
              <td className="p-4">10</td>
              <td className="p-4">10</td>
              <td className="p-4">-</td>
              <td className="p-4">매수</td>
              <td className="p-4">60,000</td>
              <td className="p-4">60,500</td>
              <td className="p-4">즉시체결</td>
              <td className="p-4">-</td>
            </tr>
            <tr className="text-gray-700 text-sm">
              <td className="p-4">654321</td>
              <td className="p-4">LG화학</td>
              <td className="p-4">5</td>
              <td className="p-4">0</td>
              <td className="p-4">취소</td>
              <td className="p-4">매도</td>
              <td className="p-4">800,000</td>
              <td className="p-4">-</td>
              <td className="p-4">-</td>
              <td className="p-4">고객 취소</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    // <div className="h-full flex flex-col">
    //   {/* <Helmet>
    //     <title>{`TooT - ${stockItem.stockName}`}</title>
    //   </Helmet> */}
    //   {/* 상단 캐러셀 */}
    //   <div className="h-1/5">{/* <FavoriteItemsCarousel /> */}</div>
    //   {/* 하단 상세 정보 */}
    //   <div className="h-4/5 px-6 pb-4">
    //     <div className="h-full grid grid-rows-6 grid-cols-3 gap-4">
    //       {/* 종목명, 코드 등 */}
    //       <div className="row-span-1 col-span-3 flex items-center">
    //         {/* <StockDetailsTitle stockId={stockId} stockItem={stockItem} /> */}
    //       </div>
    //       {/* 주식 차트 */}
    //       <div className="row-span-5 col-span-2">
    //         {/* <StockChart stockItem={stockItem} /> */}
    //       </div>
    //       {/* 종목 정보 */}
    //       <div className="row-span-5 col-span-1">
    //         {/* <StockInformationTabs stockId={stockId} stockItem={stockItem} /> */}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Order;
