using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CoreXT.Demos.Models
{
    public class Contact
    {
        [Key]
        public int id { get; set; }
        public string name { get; set; }
        public DateTime dob { get; set; }
    }
}
