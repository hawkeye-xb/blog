# Figma MCP 原始数据输出

URL: https://www.figma.com/design/k0mSHNH3VmapS9ZamxFkVl/PLAUD-AI-SDK?node-id=12849-12248&m=dev
Node ID: 12849-12248

## 1. get_metadata 原始输出

```xml
<frame id="12849:12248" name="Frame 1739333131" x="0" y="60" width="952" height="676">
  <instance id="12849:12249" name="Filter Bar" x="0" y="0" width="952" height="32" />
  <symbol id="13088:67609" name="Frame 1739333044" x="0" y="52" width="952" height="572" />
  <frame id="12849:12627" name="per page" x="0" y="644" width="244" height="32">
    <instance id="12849:12628" name="Pagination" x="0" y="1" width="30" height="30" />
    <instance id="12849:12629" name="Pagination" x="34" y="0" width="32" height="32" />
    <instance id="12849:12630" name="Pagination" x="70" y="0" width="32" height="32" />
    <instance id="12849:12631" name="Pagination" x="106" y="0" width="32" height="32" />
    <instance id="12849:12632" name="Pagination" x="142" y="0" width="32" height="32" />
    <instance id="12849:12633" name="Pagination" x="178" y="0" width="32" height="32" />
    <instance id="12849:12634" name="Pagination" x="214" y="1" width="30" height="30" />
  </frame>
</frame>
```

**附加信息：**
IMPORTANT: After you call this tool, you MUST call get_code if trying to implement the design, since this tool only returns metadata. If you do not call get_code, the agent will not be able to implement the design.

## 2. get_code 原始输出

```typescript
const imgVector7658 = "http://localhost:3845/assets/8fa6a1747e49dc54c08c5fb0750447b733c93e84.svg";
const imgEllipse38230 = "http://localhost:3845/assets/3dec331008d6507c1cfe70ac78546a05f5745700.svg";
const imgChevronIcon = "http://localhost:3845/assets/176469a1043f01679ec5fcc2cd289a2fef9109e8.svg";
const img = "http://localhost:3845/assets/e0109b0231ea19cf4f9f2be293638539fe2f98b3.svg";
const img1 = "http://localhost:3845/assets/367ff03ca58c90323f5cb8c03fa0367d4a1ee77e.svg";
const img2 = "http://localhost:3845/assets/9186c56ae974a987f0816b6db9bb9fd95639370f.svg";
const img3 = "http://localhost:3845/assets/12021f7133e8abafcdf3fcaef7f7859fb3b99559.svg";
const img4 = "http://localhost:3845/assets/58f203cd832ae7035b24374a720983f74d131c44.svg";
const img5 = "http://localhost:3845/assets/cc982995db6fc68f0c300489f8032520cc76a255.svg";
const img6 = "http://localhost:3845/assets/05d94c3190e5d9f0f6bb75c11d08f3ff6a3a50a7.svg";

function Search() {
  return (
    <div className="relative size-full" data-name="search" data-node-id="12318:25276">
      <div className="absolute inset-[67.5%_15%_15%_67.5%]" data-node-id="12318:25277">
        <div className="absolute inset-[-10.101%]" style={{ "--stroke-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
          <img alt className="block max-w-none size-full" src={imgVector7658} />
        </div>
      </div>
      <div className="absolute bottom-1/4 left-[15%] right-1/4 top-[15%]" data-node-id="12318:25278">
        <div className="absolute inset-[-4.167%]" style={{ "--stroke-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
          <img alt className="block max-w-none size-full" src={imgEllipse38230} />
        </div>
      </div>
    </div>
  );
}

interface FilterOptionProps {
  state?: "Default" | "Selected" | "Active";
}

function FilterOption({ state = "Default" }: FilterOptionProps) {
  return (
    <div className="bg-white relative rounded-[5px] size-full" data-name="State=Default" data-node-id="12555:10420">
      <div className="box-border content-stretch flex items-center justify-between min-w-inherit overflow-clip px-2 py-1 relative size-full">
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[12px] text-nowrap" data-node-id="12555:10397">
          <p className="leading-[18px] whitespace-pre">Last 24 hours</p>
        </div>
        <div className="overflow-clip relative rounded-[5px] shrink-0 size-4" data-name="Chevron" data-node-id="12555:10398">
          <div className="absolute h-2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[5px]" data-name="Chevron Icon" data-node-id="12555:10399" style={{ left: "calc(50% + 0.5px)" }}>
            <div className="absolute bottom-[-12.17%] left-[-7.07%] right-0 top-[-8.84%]">
              <img alt className="block max-w-none size-full" src={imgChevronIcon} />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[5px]" />
    </div>
  );
}

interface TagProps {
  type?: "Error" | "Success" | "Warning";
}

function Tag({ type = "Success" }: TagProps) {
  if (type === "Warning") {
    return (
      <div className="bg-[rgba(250,190,62,0.2)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] size-full" data-name="Type=Warning" data-node-id="12831:38293">
        <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#cc7447] text-[14px] text-center w-[27px]" data-node-id="12831:38285">
          <p className="leading-[22px]">429</p>
        </div>
        <div className="overflow-clip relative shrink-0 size-4" data-name="warning" data-node-id="12861:24385">
          <div className="absolute inset-[13.98%_15.21%_19.31%_12.59%]" id="node-I12861_24385-12862_24640">
            <div className="absolute inset-[-0.94%_-0.56%_-4.68%_-1.8%]" style={{ "--stroke-0": "rgba(204, 116, 71, 1)" } as React.CSSProperties}>
              <img alt className="block max-w-none size-full" src={img} />
            </div>
          </div>
          <div className="absolute inset-[59.98%_44.08%_30.2%_46.11%]" data-name="Vector" id="node-I12861_24385-12862_24693">
            <img alt className="block max-w-none size-full" src={img1} />
          </div>
          <div className="absolute inset-[37.41%_48.97%_43.84%_51.03%]" id="node-I12861_24385-12862_24694">
            <div className="absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0" style={{ "--stroke-0": "rgba(204, 116, 71, 1)" } as React.CSSProperties}>
              <img alt className="block max-w-none size-full" src={img2} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (type === "Error") {
    return (
      <div className="bg-[rgba(255,80,63,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] size-full" data-name="Type=Error" data-node-id="12831:38339">
        <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#ff503f] text-[14px] text-center w-[27px]" data-node-id="12831:38338">
          <p className="leading-[22px]">500</p>
        </div>
        <div className="overflow-clip relative shrink-0 size-3.5" data-name="xmark_for_nav" data-node-id="12861:24425">
          <div className="absolute inset-[20.58%_20.57%_20.57%_20.58%]" data-name="Vector" id="node-I12861_24425-12318_30596">
            <div className="absolute inset-[-4.29%]" style={{ "--stroke-0": "rgba(255, 80, 63, 1)" } as React.CSSProperties}>
              <img alt className="block max-w-none size-full" src={img3} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] size-full" data-name="Type=Success" data-node-id="12831:38321">
      <div className="flex flex-col font-['Inter:Regular',_sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#4cbf69] text-[14px] text-center w-[27px]" data-node-id="12831:38316">
        <p className="leading-[22px]">200</p>
      </div>
      <div className="overflow-clip relative shrink-0 size-3.5" data-name="checkmark" data-node-id="12861:23767">
        <div className="absolute flex inset-[31.94%_20%_28.06%_20%] items-center justify-center">
          <div className="flex-none h-[6.4px] rotate-[180deg] scale-y-[-100%] w-[9.6px]">
            <div className="relative size-full" data-name="Vector" id="node-I12861_23767-12318_30492">
              <div className="absolute inset-[-6.31%_-4.21%_-12.63%_-4.21%]" style={{ "--stroke-0": "rgba(76, 191, 105, 1)" } as React.CSSProperties}>
                <img alt className="block max-w-none size-full" src={img4} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame1739333044() {
  return (
    <div className="content-stretch flex items-start justify-start relative size-full" data-node-id="13088:67609">
      <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-[155px]" data-name="1" data-node-id="12849:12251">
        <div className="box-border content-stretch flex gap-3 h-8 items-center justify-start pl-0 pr-2 py-2 relative shrink-0 w-full" data-name="Table header cell" data-node-id="12849:12252">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#858c9b] text-[12px] text-nowrap" id="node-I12849_12252-220_8885">
            <p className="leading-[18px] whitespace-pre">Time</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12253">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12257">
            <p className="leading-[22px] whitespace-pre">29 Aug, 15:40:02</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12258">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12262" style={{ width: "min-content" }}>
            <p className="leading-[22px]">29 Aug, 15:39:22</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12268">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12272">
            <p className="leading-[22px] whitespace-pre">29 Aug, 15:37:55</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12273">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12277" style={{ width: "min-content" }}>
            <p className="leading-[22px]">29 Aug, 15:36:45</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12278">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12282">
            <p className="leading-[22px] whitespace-pre">29 Aug, 15:34:18</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12283">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12287" style={{ width: "min-content" }}>
            <p className="leading-[22px]">29 Aug, 15:33:05</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12288">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12292">
            <p className="leading-[22px] whitespace-pre">29 Aug, 15:31:12</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12293">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12297">
            <p className="leading-[22px] whitespace-pre">29 Aug, 15:28:47</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12298">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12302" style={{ width: "min-content" }}>
            <p className="leading-[22px]">29 Aug, 15:27:30</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-[92px]" data-name="2" data-node-id="12849:12303">
        <div className="box-border content-stretch flex gap-3 h-8 items-center justify-start pl-0 pr-6 py-2 relative shrink-0 w-full" data-name="Table header cell" data-node-id="12849:12304">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#858c9b] text-[12px] text-nowrap" id="node-I12849_12304-220_8885">
            <p className="leading-[18px] whitespace-pre">Status</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12305">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12309">
            <Tag />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12310">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(250,190,62,0.2)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12316">
            <Tag type="Warning" />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12317">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(255,80,63,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12321">
            <Tag type="Error" />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12322">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12326">
            <Tag />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12327">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12331">
            <Tag />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12332">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12336">
            <Tag />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12337">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12341">
            <Tag />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12342">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12346">
            <Tag />
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12347">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="bg-[rgba(54,217,108,0.1)] box-border content-stretch flex gap-1 items-center justify-center px-2 py-0.5 relative rounded-[5px] shrink-0" data-name="Tag" data-node-id="12849:12351">
            <Tag />
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-[156px]" data-name="3" data-node-id="12849:12357">
        <div className="box-border content-stretch flex gap-3 h-8 items-center justify-start pl-0 pr-6 py-2 relative shrink-0 w-full" data-name="Table header cell" data-node-id="12849:12358">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#858c9b] text-[12px] text-nowrap" id="node-I12849_12358-220_8885">
            <p className="leading-[18px] whitespace-pre">Event</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12359">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12363" style={{ width: "min-content" }}>
            <p className="leading-[22px]">summary.ready</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12364">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12368">
            <p className="leading-[22px] whitespace-pre">transcript.ready</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12369">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12373" style={{ width: "min-content" }}>
            <p className="leading-[22px]">recording.ready</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12374">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12378" style={{ width: "min-content" }}>
            <p className="leading-[22px]">note.completed</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12379">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12383" style={{ width: "min-content" }}>
            <p className="leading-[22px]">error.validation</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13795">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13799" style={{ width: "min-content" }}>
            <p className="leading-[22px]">summary.ready</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13800">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12861:13804">
            <p className="leading-[22px] whitespace-pre">transcript.ready</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13805">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13809" style={{ width: "min-content" }}>
            <p className="leading-[22px]">recording.ready</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13810">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13814" style={{ width: "min-content" }}>
            <p className="leading-[22px]">note.completed</p>
          </div>
        </div>
      </div>
      <div className="basis-0 content-stretch flex flex-col grow items-start justify-start min-h-px min-w-px relative shrink-0" data-name="4" data-node-id="12849:12409">
        <div className="box-border content-stretch flex gap-3 h-8 items-center justify-start pl-0 pr-2 py-2 relative shrink-0 w-full" data-name="Table header cell" data-node-id="12849:12410">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#858c9b] text-[12px] text-nowrap" id="node-I12849_12410-220_8885">
            <p className="leading-[18px] whitespace-pre">Destination</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12411">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12415" style={{ width: "min-content" }}>
            <p className="leading-[22px]">research-lab-lon…customer.example.com</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12416">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12420" style={{ width: "min-content" }}>
            <p className="leading-[22px]">payments-prod-us…company-name.cloud</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12421">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12425" style={{ width: "min-content" }}>
            <p className="leading-[22px]">ing-analytics-ue2.dee…alpha-group.co</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12426">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12430" style={{ width: "min-content" }}>
            <p className="leading-[22px]">eu-west-1-long-ten…myapp.example.com</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13816">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13820" style={{ width: "min-content" }}>
            <p className="leading-[22px]">research-lab-lon…customer.example.com</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col h-[60px] items-start justify-center pl-0 pr-6 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13821">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13825" style={{ width: "min-content" }}>
            <p className="leading-[22px]">payments-prod-us…company-name.cloud</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13826">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13830" style={{ width: "min-content" }}>
            <p className="leading-[22px]">ing-analytics-ue2.dee…alpha-group.co</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12446">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12450" style={{ width: "min-content" }}>
            <p className="leading-[22px]">plaud-tenant-super…customer.example.co</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-2 h-[60px] items-start justify-center pl-0 pr-6 py-5 relative shrink-0 w-full" data-name="Table cell" data-node-id="12861:13832">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12861:13836" style={{ width: "min-content" }}>
            <p className="leading-[22px]">eu-west-1-long-ten…myapp.example.com</p>
          </div>
        </div>
      </div>
      <div className="content-stretch flex flex-col items-start justify-start relative shrink-0 w-[232px]" data-name="6" data-node-id="12849:12513">
        <div className="box-border content-stretch flex gap-3 h-8 items-center justify-start px-0 py-2 relative shrink-0 w-full" data-name="Table header cell" data-node-id="12849:12514">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#858c9b] text-[12px] text-nowrap" id="node-I12849_12514-220_8885">
            <p className="leading-[18px] whitespace-pre">Webhook</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12515">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12519" style={{ width: "min-content" }}>
            <p className="leading-[22px]">Core Webhook • wh_end_9fa2</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12521">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12525" style={{ width: "min-content" }}>
            <p className="[text-overflow:inherit] [text-wrap-mode:inherit]\' [white-space-collapse:inherit] leading-[22px] overflow-inherit">Billing Webhook • wh_end_us03</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12527">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="12849:12531" style={{ width: "min-content" }}>
            <p className="[text-overflow:inherit] [text-wrap-mode:inherit]\' [white-space-collapse:inherit] leading-[22px] overflow-inherit">Analytics Pipeline • wh_end_an55rw</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12533">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12537" style={{ width: "min-content" }}>
            <p className="leading-[22px]">QA Webhook • wh_end_41c7</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="13086:67580">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="13086:67584" style={{ width: "min-content" }}>
            <p className="leading-[22px]">Core Webhook • wh_end_9fa2</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="13086:67586">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[#3d3d3d] text-[14px] text-nowrap" data-node-id="13086:67590" style={{ width: "min-content" }}>
            <p className="[text-overflow:inherit] [text-wrap-mode:inherit]\' [white-space-collapse:inherit] leading-[22px] overflow-inherit">Billing Webhook • wh_end_us03</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="13086:67592">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="13086:67596" style={{ width: "min-content" }}>
            <p className="leading-[22px]">Analytics Pipeline • wh_end_an55</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="13086:67598">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="13086:67602" style={{ width: "min-content" }}>
            <p className="leading-[22px]">QA Webhook • wh_end_41c7</p>
          </div>
        </div>
        <div className="box-border content-stretch flex flex-col gap-1 h-[60px] items-start justify-center px-0 py-2 relative shrink-0 w-full" data-name="Table cell" data-node-id="12849:12539">
          <div aria-hidden="true" className="absolute border-[#ebebeb] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] min-w-full not-italic relative shrink-0 text-[#3d3d3d] text-[14px]" data-node-id="12849:12543" style={{ width: "min-content" }}>
            <p className="leading-[22px]">Acme Retail • wh_end_ac7d</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PaginationProps {
  leftArrow?: boolean;
  type?: "Arrow" | "Number";
  state?: "Disabled" | "Active" | "Hover";
  number?: "Default" | "Primary" | "Secondary";
  arrowLeft?: "Yes" | "No";
  arrowRight?: "No" | "Yes";
}

function Pagination({ leftArrow = true, type = "Arrow", state = "Active", number = "Default", arrowLeft = "Yes", arrowRight = "No" }: PaginationProps) {
  if (type === "Arrow" && state === "Active" && number === "Default" && arrowLeft === "No" && arrowRight === "Yes") {
    return (
      <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] size-full" data-name="Type=Arrow, State=Active, Number=Default, Arrow left=No, Arrow Right=Yes" data-node-id="12038:9432">
        <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[5px]" />
        <div className="flex items-center justify-center relative shrink-0">
          <div className="flex-none scale-y-[-100%]">
            <div className="overflow-clip relative size-5" data-name="chevron_right" data-node-id="12964:48329">
              <div className="absolute flex inset-[18.98%_33.82%] items-center justify-center">
                <div className="flex-none h-[14.889px] scale-y-[-100%] w-[7.767px]">
                  <div className="relative size-full" data-name="Vector" id="node-I12964_48329-440_5732">
                    <div className="absolute inset-[-2.92%_-7.72%_-2.9%_-5.36%]" style={{ "--stroke-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
                      <img alt className="block max-w-none size-full" src={img5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (type === "Number" && state === "Active" && number === "Secondary" && arrowLeft === "No" && arrowRight === "No") {
    return (
      <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] size-full" data-name="Type=Number, State=Active, Number=Secondary, Arrow left=No, Arrow Right=No" data-node-id="12038:9454">
        <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-400 text-nowrap" data-node-id="12038:9455">
          <p className="leading-[20px] whitespace-pre">1</p>
        </div>
      </div>
    );
  }
  return (
    <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] size-full" data-name="Type=Arrow, State=Active, Number=Default, Arrow left=Yes, Arrow Right=No" data-node-id="12038:9440">
      <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[5px]" />
      <div className="flex items-center justify-center relative shrink-0">
        <div className="flex-none scale-y-[-100%]">
          <div className="overflow-clip relative size-5" data-name="chevron_left" data-node-id="12964:48572">
            <div className="absolute flex inset-[18.94%_39.33%_19.02%_28.31%] items-center justify-center">
              <div className="flex-none h-[14.889px] scale-y-[-100%] w-[7.767px]">
                <div className="relative size-full" data-name="Vector" id="node-I12964_48572-162_4725">
                  <div className="absolute inset-[-2.92%_-5.36%_-2.9%_-7.72%]" style={{ "--stroke-0": "rgba(0, 0, 0, 1)" } as React.CSSProperties}>
                    <img alt className="block max-w-none size-full" src={img6} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Frame1739333131() {
  return (
    <div className="content-stretch flex flex-col gap-5 items-start justify-end relative size-full" data-node-id="12849:12248">
      <div className="content-stretch flex gap-2 h-8 items-center justify-start relative shrink-0 w-[952px]" data-name="Filter Bar" data-node-id="12849:12249">
        <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0" data-name="search & filter" id="node-I12849_12249-12831_35979">
          <div className="bg-white h-8 relative rounded-[5px] shrink-0 w-[273px]" data-name="Search Field" id="node-I12849_12249-12555_10389">
            <div className="box-border content-stretch flex h-8 items-center justify-start overflow-clip p-[8px] relative w-[273px]">
              <div className="content-stretch flex gap-2 items-center justify-start relative shrink-0" data-name="Content" id="node-I12849_12249-12555_10389-12319_12190">
                <div className="overflow-clip relative shrink-0 size-4" data-name="search" id="node-I12849_12249-12555_10389-12319_12191">
                  <Search />
                </div>
                <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic overflow-ellipsis overflow-hidden relative shrink-0 text-[12px] text-neutral-400 text-nowrap" id="node-I12849_12249-12555_10389-12319_12192">
                  <p className="[text-overflow:inherit] leading-[18px] overflow-inherit whitespace-pre">Search events or destinations</p>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[5px]" />
          </div>
          <div className="bg-white h-8 min-w-[105px] relative rounded-[5px] shrink-0 w-[114px]" data-name="Filter Option" id="node-I12849_12249-12814_43558">
            <div className="box-border content-stretch flex h-8 items-center justify-between min-w-inherit overflow-clip px-2 py-1 relative w-[114px]">
              <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[12px] w-[78px]" id="node-I12849_12249-12814_43558-12555_10397">
                <p className="leading-[18px]">Today</p>
              </div>
              <div className="overflow-clip relative rounded-[5px] shrink-0 size-4" data-name="Chevron" id="node-I12849_12249-12814_43558-12555_10398">
                <div className="absolute h-2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[5px]" data-name="Chevron Icon" id="node-I12849_12249-12814_43558-12555_10399" style={{ left: "calc(50% + 0.5px)" }}>
                  <div className="absolute bottom-[-12.17%] left-[-7.07%] right-0 top-[-8.84%]">
                    <img alt className="block max-w-none size-full" src={imgChevronIcon} />
                  </div>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[5px]" />
          </div>
          <div className="bg-white h-8 min-w-[105px] relative rounded-[5px] shrink-0 w-[114px]" data-name="Filter Option" id="node-I12849_12249-12831_30607">
            <FilterOption />
          </div>
          <div className="bg-white h-8 min-w-[105px] relative rounded-[5px] shrink-0 w-[114px]" data-name="Filter Option" id="node-I12849_12249-12831_32180">
            <div className="box-border content-stretch flex h-8 items-center justify-between min-w-inherit overflow-clip px-2 py-1 relative w-[114px]">
              <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#3d3d3d] text-[12px] w-[78px]" id="node-I12849_12249-12831_32180-12555_10397">
                <p className="leading-[18px]">Any Event</p>
              </div>
              <div className="overflow-clip relative rounded-[5px] shrink-0 size-4" data-name="Chevron" id="node-I12849_12249-12831_32180-12555_10398">
                <div className="absolute h-2 top-1/2 translate-x-[-50%] translate-y-[-50%] w-[5px]" data-name="Chevron Icon" id="node-I12849_12249-12831_32180-12555_10399" style={{ left: "calc(50% + 0.5px)" }}>
                  <div className="absolute bottom-[-12.17%] left-[-7.07%] right-0 top-[-8.84%]">
                    <img alt className="block max-w-none size-full" src={imgChevronIcon} />
                  </div>
                </div>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#ebebeb] border-solid inset-0 pointer-events-none rounded-[5px]" />
          </div>
        </div>
      </div>
      <div className="content-stretch flex items-start justify-start relative shrink-0 w-full" data-node-id="13088:67609">
        <Frame1739333044 />
      </div>
      <div className="content-stretch flex gap-1 items-center justify-start relative shrink-0" data-name="per page" data-node-id="12849:12627">
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-[30px]" data-name="Pagination" data-node-id="12849:12628">
          <Pagination />
        </div>
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-8" data-name="Pagination" data-node-id="12849:12629">
          <Pagination type="Number" number="Secondary" arrowLeft="No" />
        </div>
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-8" data-name="Pagination" data-node-id="12849:12630">
          <div className="font-['Inter:Semibold',_sans-serif] leading-[0] not-italic relative shrink-0 text-[14px] text-black text-nowrap" id="node-I12849_12630-12038_9449">
            <p className="leading-[20px] whitespace-pre">2</p>
          </div>
        </div>
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-8" data-name="Pagination" data-node-id="12849:12631">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-400 text-nowrap" id="node-I12849_12631-12038_9455">
            <p className="leading-[20px] whitespace-pre">3</p>
          </div>
        </div>
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-8" data-name="Pagination" data-node-id="12849:12632">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-400 text-nowrap" id="node-I12849_12632-12038_9455">
            <p className="leading-[20px] whitespace-pre">...</p>
          </div>
        </div>
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-8" data-name="Pagination" data-node-id="12849:12633">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-neutral-400 text-nowrap" id="node-I12849_12633-12038_9455">
            <p className="leading-[20px] whitespace-pre">8</p>
          </div>
        </div>
        <div className="box-border content-stretch flex gap-1.5 items-center justify-center p-[8px] relative rounded-[5px] shrink-0 size-[30px]" data-name="Pagination" data-node-id="12849:12634">
          <Pagination arrowLeft="No" arrowRight="Yes" />
        </div>
      </div>
    </div>
  );
}
```

**附加信息：**
- Use tailwind if available, otherwise detect the project's styling approach (e.g. CSS in JS, CSS Modules, theme providers, etc) and follow it. Use vanilla CSS only if no system is detected. Do not install any dependencies.
- Node ids have been added to the code as data attributes, e.g. `data-node-id="1:2"`.
- These variables are contained in the design: Labels/Primary: #000000, Labels/Quaternary: #a3a3a3, Font Size/Footnote: 14, Font Weight/Regular: Regular, Font Family/Font: Inter, Line Height/Footnote: 20, Footnote Regular: Font(family: "Inter", style: Regular, size: 12, weight: 400, lineHeight: 18), Spacing_8: 8, Radius_5: 5, Labels/White: #ffffff, Grays/Gray 1: #ebebeb, Labels/Secondary: #3d3d3d, Spacing_4: 4, Labels/Tertiary: #858c9b, Font Size/Body: 14, Line Height/Body: 22, Body: Font(family: "Inter", style: Regular, size: 14, weight: 400, lineHeight: 22), Spacing_24: 24, Separators/Default: #ebebeb, Template Community/Icon/Moss: #4cbf69, Template Community/Icon/Ember: #cc7447, Status/Destructive: #ff503f, Footnote/Regular: Font(family: "Inter", style: Regular, size: 14, weight: 400, lineHeight: 20), Font Weight/Emphasized: Semibold, Footnote/Emphasized: Font(family: "Inter", style: Semi Bold, size: 14, weight: 600, lineHeight: 20), Spacing_20: 20.
- Image assets are stored on a localhost server. Clients can use these images directly in code as a way to view the image assets the same way they would other remote servers. Images and SVGs will be stored as constants, e.g. const image = 'http://localhost:3845/assets/10c13ac1a228a365cb98a0064b1d5afbc84887b2.png' These constants will be used in the code as the source for the image, e.g. <img src={image} /> This is true for both images and SVGs, so you can use the same approach for both types of assets.
- IMPORTANT: After you call this tool, you MUST call get_image to get an image of the node for context.

## 3. get_variable_defs 原始输出

```json
{"Labels/Primary":"#000000","Labels/Quaternary":"#a3a3a3","Font Size/Footnote":"14","Font Weight/Regular":"Regular","Font Family/Font":"Inter","Line Height/Footnote":"20","Footnote Regular":"Font(family: \"Inter\", style: Regular, size: 12, weight: 400, lineHeight: 18)","Spacing_8":"8","Radius_5":"5","Labels/White":"#ffffff","Grays/Gray 1":"#ebebeb","Labels/Secondary":"#3d3d3d","Spacing_4":"4","Labels/Tertiary":"#858c9b","Font Size/Body":"14","Line Height/Body":"22","Body":"Font(family: \"Inter\", style: Regular, size: 14, weight: 400, lineHeight: 22)","Spacing_24":"24","Separators/Default":"#ebebeb","Template Community/Icon/Moss":"#4cbf69","Template Community/Icon/Ember":"#cc7447","Status/Destructive":"#ff503f","Footnote/Regular":"Font(family: \"Inter\", style: Regular, size: 14, weight: 400, lineHeight: 20)","Font Weight/Emphasized":"Semibold","Footnote/Emphasized":"Font(family: \"Inter\", style: Semi Bold, size: 14, weight: 600, lineHeight: 20)","Spacing_20":"20"}
```

## 4. get_code_connect_map 原始输出

```
Code Connect is only available on the Organization and Enterprise plans
```

## 总结

以上是从 Figma MCP 工具获取的所有原始数据输出，包括：

1. **get_metadata**: XML 格式的节点结构信息
2. **get_code**: 完整的 React TypeScript 组件代码
3. **get_variable_defs**: JSON 格式的设计变量定义
4. **get_code_connect_map**: 企业版功能提示信息

这些数据可以直接用于开发和设计系统构建。
