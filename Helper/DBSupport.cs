using ChatApp.Web.Hubs;
using ChatApp.Web.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace ChatApp.Web.Helper
{
    public static class DBSupport
    {
        // Properties

        private static SqlConnection con
        {
            get
            {
                return new SqlConnection(ConfigurationManager.ConnectionStrings["DBConStr"].ConnectionString);
            }
        }

        // DB Operations Related to RegisteredUsers

        public static bool IsSignupIdExist(int Id)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("IsSignupIdExist", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ID", Id);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 0 ? false : true;
            }
        }

        public static bool IsSignupUserExist(SignupUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("IsSignupUserExist", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", user.Username);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 0 ? false : true;
            }
        }


        public static SignupUser GetSignupUser(SignupUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("GetSignupUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", user.Username);
                cmd.Parameters.AddWithValue("@Password", SharedSupport.MD5Encrypt(user.Password));

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.HasRows)
                {
                    dr.Read();
                    return new SignupUser
                    {
                        Id = Convert.ToInt32(dr[1]),
                        Username = dr[2].ToString(),
                        Gender = dr[4].ToString(),
                        Age = Convert.ToInt32(dr[5]),
                    };
                }
            }
            return null;
        }

        public static bool SignupNewUser(SignupUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("SignupNewUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ID", user.Id);
                cmd.Parameters.AddWithValue("@Username", user.Username);
                cmd.Parameters.AddWithValue("@Password", SharedSupport.MD5Encrypt(user.Password));
                cmd.Parameters.AddWithValue("@Gender", user.Gender);
                cmd.Parameters.AddWithValue("@Age", user.Age);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 1 ? true : false;
            }
        }

        // DB Operations Related to UsersTable

        // Methods

        public static bool AddNewUser(ChatUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("AddNewUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ID", user.Id);
                cmd.Parameters.AddWithValue("@IsMod", user.IsMod);
                cmd.Parameters.AddWithValue("@ConnectionId", user.ConnectionId);
                cmd.Parameters.AddWithValue("@Username", user.Username);
                cmd.Parameters.AddWithValue("@Gender", user.Gender);
                cmd.Parameters.AddWithValue("@Age", user.Age);
                cmd.Parameters.AddWithValue("@Blocks", user.Blocks);
                cmd.Parameters.AddWithValue("@Photo", user.Photo);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 1 ? true : false;
            }
        }

        public static void BlockUser(ChatUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("BlockUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", user.Username);
                cmd.Parameters.AddWithValue("@Blocks", user.Blocks);

                cmd.ExecuteNonQuery();
            }
        }

        public static ChatUser GetUser(ChatUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("GetUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", string.IsNullOrEmpty(user.Username) ? string.Empty : user.Username);
                cmd.Parameters.AddWithValue("@ConnectionId", string.IsNullOrEmpty(user.ConnectionId) ? string.Empty : user.ConnectionId);

                SqlDataReader dr = cmd.ExecuteReader();

                if (dr.HasRows)
                {
                    dr.Read();
                    return new ChatUser
                    {
                        Id = Convert.ToInt32(dr[1]),
                        IsMod = Convert.ToInt32(dr[2]),
                        ConnectionId = dr[3].ToString(),
                        Username = dr[4].ToString(),
                        Gender = dr[5].ToString(),
                        Age = Convert.ToInt32(dr[6]),
                        Photo = Convert.ToString(dr[7]),
                        Blocks = Convert.ToString(dr[8]),
                        ConnectTime = Convert.ToDateTime(dr[9])
                    };
                }
            }
            return null;
        }

        public static bool UpdateUser(ChatUser user)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("UpdateUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ID", user.Id);
                cmd.Parameters.AddWithValue("@ConnectionId", user.ConnectionId);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 0 ? false : true;
            }
        }

        public static IEnumerable<ChatUser> GetAllUsers()
        {
            List<ChatUser> chatUsers = null;
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("GetUsers", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                SqlDataReader dr = cmd.ExecuteReader();
                if (dr.HasRows)
                {
                    chatUsers = new List<ChatUser>();
                    while (dr.Read())
                    {
                        chatUsers.Add(new ChatUser
                        {
                            IsMod = Convert.ToInt32(dr[2]),
                            Username = dr[4].ToString(),
                            Gender = dr[5].ToString(),
                            Age = Convert.ToInt32(dr[6]),
                            Photo = Convert.ToString(dr[7]),
                        });
                    }
                    chatUsers.TrimExcess();
                }
            }
            return chatUsers;
        }

        public static IEnumerable<ChatUser> GetUsers()
        {
            List<ChatUser> chatUsers = null;
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("GetUsers", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                SqlDataReader dr = cmd.ExecuteReader();
                if (dr.HasRows)
                {
                    chatUsers = new List<ChatUser>();
                    while (dr.Read())
                    {
                        chatUsers.Add(new ChatUser
                        {
                            Id = Convert.ToInt32(dr[1]),
                            IsMod = Convert.ToInt32(dr[2]),
                            ConnectionId = dr[3].ToString(),
                            Username = dr[4].ToString(),
                            Gender = dr[5].ToString(),
                            Age = Convert.ToInt32(dr[6]),
                            Photo = Convert.ToString(dr[7]),
                            Blocks = Convert.ToString(dr[8]),
                            ConnectTime = Convert.ToDateTime(dr[9])
                        });
                    }
                    chatUsers.TrimExcess();
                }
            }
            return chatUsers;
        }

        public static int GetUsersCount()
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("GetUsersCount", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        public static bool DeleteUser(string username)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("DeleteUser", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", username);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 0 ? true : false;
            }
        }

        public static void DeleteAllUsers()
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("Delete From UserTable", sqlCon);

                cmd.ExecuteNonQuery();
            }
        }

        public static void DeleteSignedOffUsers(Object source, System.Timers.ElapsedEventArgs e)
        {
            IEnumerable<ChatUser> users = GetUsers();

            List<string> bots = new List<string>() { 
                                  "AaShQii", "Aliza", "AmirJoya", "Ayaan", "Baazigarr", "BholaBacha", "Blood_Seeker", "Diyyaa",
                                  "Eman", "FireCracker", "GreeN-Eyes", "Hamza26", "Iffi", "James", "Jazib", "JDee", "JohnSnow", 
                                  "Khanaa", "Khoobsoorat", "King_of_Hrtzz", "LalaGujjar", "MamooJaan", "Manal", "Mubeen", "Mystic", 
                                  "Namaloom", "Neha", "Peshawar_Man", "RaffatKhan", "Sara", "SarfarazJutt", "StevePapp", "Zain",
                                  "Uzair", "GaNdA_BaChA", "Dewana", "Bilal25", "Sehrish", "SpiderBoy", "Shahzad_akram"
                                };

            if (users != null)
            {
                foreach (var item in users)
                {
                    if (bots.Where(x => x == item.Username).Count() == 0 && item.ConnectTime < DateTime.UtcNow.AddHours(5).AddMinutes(-20))
                    {
                        if (DeleteUser(item.Username))
                        {
                            if (!string.IsNullOrEmpty(item.Photo))
                            {
                                string image = SharedSupport.GetImageFolderPath() + item.Username + item.Photo.Substring(item.Photo.LastIndexOf("."));
                                if (System.IO.File.Exists(image))
                                    System.IO.File.Delete(image);
                            }

                            IHubContext hubContext = GlobalHost.ConnectionManager.GetHubContext<Chat>();
                            hubContext.Clients.AllExcept(item.ConnectionId).userLeft(item.Username);
                            hubContext.Clients.All.totalUsers(DBSupport.GetUsersCount());
                            hubContext.Clients.Client(item.ConnectionId).forceDisconnect();
                            hubContext.Clients.All.dcUserSessions(item.Username);
                        }
                    }
                }
            }
        }

        public static bool IsIdExist(int Id)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("IsIdExist", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ID", Id);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 0 ? false : true;
            }
        }

        // DB Operations Related to ModTable

        // Methods

        public static IEnumerable<string> GetMods()
        {
            List<string> mods = null;
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("GetMods", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                SqlDataReader dr = cmd.ExecuteReader();
                if (dr.HasRows)
                {
                    mods = new List<string>();
                    while (dr.Read())
                    {
                        mods.Add(Convert.ToString(dr[0]));
                    }
                    mods.TrimExcess();
                }
            }
            return mods;
        }

        public static bool AddNewMod(Mod mod)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("AddNewMod", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", mod.Username);
                cmd.Parameters.AddWithValue("@Password", SharedSupport.MD5Encrypt(mod.Password));

                return Convert.ToInt32(cmd.ExecuteScalar()) == 1 ? true : false;
            }
        }

        public static bool ValidateMod(Mod mod)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("ValidateMod", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", mod.Username);
                cmd.Parameters.AddWithValue("@Password", SharedSupport.MD5Encrypt(mod.Password));

                SqlDataReader dr = cmd.ExecuteReader();
                if (dr.HasRows)
                    return true;
            }
            return false;
        }

        public static bool DeleteMod(string modName)
        {
            using (SqlConnection sqlCon = con)
            {
                sqlCon.Open();

                SqlCommand cmd = new SqlCommand("DeleteMod", sqlCon);
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Username", modName);

                return Convert.ToInt32(cmd.ExecuteScalar()) == 0 ? true : false;
            }
        }
    }
}