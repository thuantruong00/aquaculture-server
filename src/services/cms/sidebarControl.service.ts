// let sidebar_content = require('~/config/cms-sidebar');
const block_table_json = require("~/config/table-role.json").block;
import { sidebarData } from "~/config/dashboardSidebar";

export const getSidebarContentService = async (
  page_id: string,
  user_type?: string
) => {
  // (<page_id_now>,<user_type>)
  const is_user = user_type ? user_type : "guest";
  let sidebar_content = sidebarData;
  // console.log(">>>>", sidebar_content)
  let active_page = undefined;
  let page_parent_active;
  let block_table = block_table_json[is_user];
  // console.log(block_table)

  let error_page = {
    active_page: {
      title: "Lỗi",
      page_name: "./cms-page/error",
      page_parent_active: "deviceControl",
      page_id: "deviceControl",
    },
    sidebar: sidebar_content,
  };

  try {
    for (const key of sidebar_content) {
      if (active_page == undefined) {
        if (key.child.length > 0) {
          page_parent_active = key.page_id;
          if (key.page_id == page_id) {
            // page_parent_active = key.page_id
            active_page = key;
            break;
          } else {
            for (const key2 of key.child) {
              if (key2.page_id == page_id) {
                active_page = key2;
                break;
              }
            }
          }
        } else {
          if (key.page_id == page_id) {
            page_parent_active = key.page_id;
            active_page = key;
            break;
          }
        }
      } else {
        break;
      }
    }
  } catch (error) {
    console.log(error);
    return error_page;
  }
  if (active_page != undefined) {
    return {
      active_page: {
        title: active_page.title,
        page_name: active_page.page_name,
        parent_id: page_parent_active,
        page_id: active_page.page_id,
      },
      sidebar: sidebar_content,
      block_table: block_table,
    };
  } else {
    return error_page;
  }
};
